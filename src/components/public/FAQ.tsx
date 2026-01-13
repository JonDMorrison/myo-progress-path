import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need to upload videos?",
    answer: "Video uploads are required for certain weeks as determined by your therapist. Your biweekly view will clearly show if uploads are needed.",
  },
  {
    question: "How do patients log in?",
    answer: "Patients use passwordless email authentication. They simply enter their email address and receive a secure login link.",
  },
  {
    question: "Can we customize program content?",
    answer: "Absolutely. The Admin interface allows you to import and customize weekly exercise programs to match your clinic's approach.",
  },
  {
    question: "Is there reporting?",
    answer: "Yes. You'll get comprehensive adherence metrics, completion trends, and patient progress reports to help optimize your therapy outcomes.",
  },
  {
    question: "Can we add more therapists later?",
    answer: "Yes! Montrose Myo supports multi-user clinics. You can add therapists and admin users as your practice grows.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Everything you need to know about Montrose Myo</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
