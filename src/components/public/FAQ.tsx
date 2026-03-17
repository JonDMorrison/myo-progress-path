import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I start without video uploads?",
    answer: "If you do not require a tongue tie surgery, you can choose to purchase our basic, feedback-free program at a reduced cost. (This may impact results if exercises are not done as instructed)",
  },
  {
    question: "Who reviews my progress?",
    answer: "Our Myofunctional Therapist at Montrose Myo",
  },
  {
    question: "How do video check-ins work?",
    answer: "For each biweekly module, you will upload first attempt and last attempt videos of your exercises for your therapist to review and provide personalized guidance",
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
