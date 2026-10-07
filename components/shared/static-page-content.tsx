import ReactMarkdown from 'react-markdown'

export default function StaticPageContent({
  title,
  content,
}: {
  title: string
  content: string
}) {
  return (
    <div className='p-4 max-w-3xl mx-auto w-full'>
      <h1 className='h1-bold py-4'>{title}</h1>
      <section className='text-justify text-lg mb-20 web-page-content'>
        <ReactMarkdown>{content}</ReactMarkdown>
      </section>
    </div>
  )
}