import Footer from "@/components/shared/footer"
import Header from "@/components/shared/header"


export default async function CommonLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <>
      <Header />
       <section className='flex-1 flex flex-col'>{children}</section>
      <Footer />
    </>
  )
}
