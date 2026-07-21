import { useState, useRef, useEffect } from "react";
import { Edit2, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  label: string;
  value: string | string[];
  isList?: boolean;
  isImproving?: boolean;
  onSave: (value: string | string[]) => void;
  onImprove: () => void;
}

export function EditableField({ 
  label, 
  value, 
  isList = false, 
  isImproving, 
  onSave, 
  onImprove 
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      setTempValue(isList && Array.isArray(value) ? value.join("\n") : (value as string));
      // Focus textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
      }, 50);
    }
  }, [isEditing, value, isList]);

  const handleSave = () => {
    if (isList) {
      const arr = tempValue.split("\n").map(s => s.trim()).filter(Boolean);
      onSave(arr);
    } else {
      onSave(tempValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="group relative flex flex-col gap-1.5 rounded-xl transition-colors duration-200 hover:bg-slate-50/50 p-3 -mx-3 dark:hover:bg-slate-800/50">
      
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</h4>
        
        {!isEditing && (
          <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 no-print">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-slate-500 hover:text-primary hover:bg-primary/10"
              onClick={() => setIsEditing(true)}
              title="Editar texto"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
              onClick={onImprove}
              disabled={isImproving}
              title="Melhorar com IA"
            >
              <Sparkles className={cn("h-3.5 w-3.5", isImproving && "animate-spin")} />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="relative animate-in fade-in zoom-in-95 duration-200">
          <Textarea
            ref={textareaRef}
            value={tempValue}
            onChange={(e) => {
              setTempValue(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] w-full resize-none border-primary/50 bg-white focus-visible:ring-primary/20 p-3 shadow-sm dark:bg-slate-900"
            placeholder={isList ? "Um item por linha..." : "Digite o texto..."}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="shadow-sm">
              <Check className="mr-1.5 h-3.5 w-3.5" /> Salvar
            </Button>
          </div>
          <div className="absolute -bottom-5 right-1 text-[10px] text-muted-foreground">
            Ctrl+Enter para salvar
          </div>
        </div>
      ) : (
        <div 
          className={cn(
            "text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 cursor-text rounded-md p-1 -m-1 transition-colors",
            isImproving && "opacity-50 blur-[1px] animate-pulse pointer-events-none"
          )}
          onClick={() => setIsEditing(true)}
        >
          {isList && Array.isArray(value) ? (
            <ul className="space-y-1.5 list-none ml-0">
              {value.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-wrap">{value}</p>
          )}
        </div>
      )}
    </div>
  );
}
