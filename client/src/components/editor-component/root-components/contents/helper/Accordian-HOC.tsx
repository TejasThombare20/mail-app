import { AccordionContent, AccordionItem, AccordionTrigger } from "src/components/ui-component/Accordian";



interface StyleSectionProps {
    value: string;
    title: string;
    children: React.ReactNode;
  }
  
  const AccordianHOC = ({ value, title, children }: StyleSectionProps) => {
    return (
      <AccordionItem value={value} className="border-b">
        <AccordionTrigger className="p-4">{title}</AccordionTrigger>
        <AccordionContent className="p-4 pt-0 flex flex-col gap-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  export default AccordianHOC;