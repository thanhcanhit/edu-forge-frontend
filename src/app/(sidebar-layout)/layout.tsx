export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>Sidebar</h1>
      {children}
    </div>
  );
}
