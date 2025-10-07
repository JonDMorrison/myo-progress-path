import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasscodeRequest {
  passcode: string;
}

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { passcode }: PasscodeRequest = await req.json();
    
    // Get IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const now = Date.now();
    const limitData = rateLimitMap.get(clientIP);
    
    if (limitData) {
      if (now < limitData.resetTime) {
        if (limitData.count >= MAX_ATTEMPTS) {
          console.log(`Rate limit exceeded for IP: ${clientIP}`);
          return new Response(
            JSON.stringify({ 
              valid: false, 
              error: 'Too many attempts. Please try again later.' 
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        // Reset window has passed
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      // First attempt
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Get the passcode from environment
    const correctPasscode = Deno.env.get('REGISTRATION_PASSCODE') || 'montrosedental';
    
    // Validate passcode (case-insensitive)
    const isValid = passcode.toLowerCase() === correctPasscode.toLowerCase();
    
    if (!isValid) {
      // Increment failure count
      const currentData = rateLimitMap.get(clientIP)!;
      rateLimitMap.set(clientIP, { ...currentData, count: currentData.count + 1 });
      
      console.log(`Invalid passcode attempt from IP: ${clientIP}`);
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in validate-passcode:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'An error occurred processing your request' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
