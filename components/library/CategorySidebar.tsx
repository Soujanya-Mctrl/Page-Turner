"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, cn } from "@/components/ui/button";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/category";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onCategoryCreated: () => void;
  onCategoryDeleted: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCategoryCreated,
  onCategoryDeleted,
  isCollapsed,
  onToggle,
}: CategorySidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createCategoryAction(newCategoryName.trim());
      if (result.success) {
        setNewCategoryName("");
        setIsAdding(false);
        toast.success(`Created collection "${newCategoryName.trim()}"`);
        onCategoryCreated();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this category? Books will not be deleted.")) return;

    try {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        if (selectedCategoryId === id) onSelectCategory(null);
        toast.success("Collection deleted");
        onCategoryDeleted();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col bg-surface border-r border-outline-variant/20 h-screen sticky top-0 py-8 z-30 overflow-hidden"
    >
      {/* Header & Toggle */}
      <div className={cn(
        "px-6 mb-10 flex items-center justify-between",
        isCollapsed && "flex-col gap-4 px-0"
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.h2 
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-display-lg text-headline-lg text-primary tracking-tight"
            >
              PageTurner
            </motion.h2>
          ) : (
            <motion.div
              key="mini-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-display text-xl shadow-lg"
            >
              P
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "rounded-full text-on-surface-variant hover:text-primary transition-transform",
            isCollapsed && "rotate-180"
          )}
        >
          <span className="material-symbols-outlined text-[20px]">
            menu_open
          </span>
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative",
            selectedCategoryId === null
              ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary font-bold"
              : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface"
          )}
        >
          <span className={cn(
            "material-symbols-outlined text-[22px] transition-colors shrink-0",
            selectedCategoryId === null ? "text-secondary" : "text-on-surface-variant group-hover:text-on-surface"
          )}>
            folder
          </span>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-title-md font-medium whitespace-nowrap"
              >
                All Books
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="pt-6 pb-2">
          <div className={cn(
            "flex items-center justify-between mb-4 px-4",
            isCollapsed && "px-2 justify-center"
          )}>
            {!isCollapsed && (
              <h3 className="text-label-caps text-on-surface-variant uppercase tracking-widest opacity-70">
                Collections
              </h3>
            )}
            <button
              onClick={() => {
                if (isCollapsed) onToggle();
                setIsAdding(true);
              }}
              className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          <AnimatePresence>
            {isAdding && !isCollapsed && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateCategory}
                className="mb-4 px-2"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="New collection..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-10 text-sm px-4 bg-surface-container-low border-b border-outline-variant focus:outline-none focus:border-secondary transition-all placeholder-on-surface-variant/50"
                  onBlur={() => !newCategoryName && setIsAdding(false)}
                />
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group relative",
                  selectedCategoryId === category.id
                    ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className={cn(
                    "material-symbols-outlined text-[18px] transition-colors shrink-0",
                    selectedCategoryId === category.id ? "text-secondary" : "text-on-surface-variant group-hover:text-on-surface"
                  )}>
                    tag
                  </span>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-body-sm font-medium truncate max-w-[140px] whitespace-nowrap"
                      >
                        {category.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {!isCollapsed && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteCategory(e, category.id)}
                      className="p-1.5 rounded-full hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                )}
              </button>
            ))}

            {categories.length === 0 && !isAdding && !isCollapsed && (
              <div className="flex flex-col items-center py-8 text-center opacity-40">
                <p className="text-label-caps italic">No collections</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={cn(
        "px-8 py-6 border-t border-outline-variant/10",
        isCollapsed && "px-0 flex justify-center"
      )}>
        <div className="flex items-center gap-3 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[18px] text-secondary/70">
            cloud
          </span>
          {!isCollapsed && (
            <span className="text-label-caps tracking-tight uppercase whitespace-nowrap">
              Sync Enabled
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
