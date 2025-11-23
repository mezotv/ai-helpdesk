import BackgroundRays from "@/components/BackgroundRays";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BackgroundRays />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
}

