interface ToolbarCarouselProps {
  children: React.ReactNode;
}

export function ToolbarCarousel({ children }: Readonly<ToolbarCarouselProps>) {
  return (
    <div
      className="flex max-w-[min(90vw,28rem)] items-center gap-0.5 overflow-x-auto overflow-y-visible scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="toolbar"
    >
      {children}
    </div>
  );
}
