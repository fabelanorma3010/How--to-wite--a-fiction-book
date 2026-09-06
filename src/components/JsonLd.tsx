export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify doesn't escape "<", so a value containing "</script>"
      // (e.g. a member's display name on /creators) would otherwise close
      // this tag early and let arbitrary HTML/script run on the page.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
