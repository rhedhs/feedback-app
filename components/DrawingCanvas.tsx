import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  initialData?: string;
  onChange?: (elements: ExcalidrawElement[]) => void;
  readOnly?: boolean;
}

export function DrawingCanvas({ initialData, onChange, readOnly = false }: DrawingCanvasProps) {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const excalidrawRef = useRef<any>(null);

  useEffect(() => {
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData);
        setElements(parsedData);
      } catch (error) {
        console.error("Error parsing initial drawing data:", error);
      }
    }
  }, [initialData]);

  const handleChange = (elements: ExcalidrawElement[]) => {
    setElements(elements);
    onChange?.(elements);
  };

  return (
    <div className="w-full h-[500px] border rounded-lg overflow-hidden">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: elements,
          appState: { viewBackgroundColor: "#ffffff" },
        }}
        onChange={handleChange}
        readOnly={readOnly}
        theme="light"
      />
    </div>
  );
}