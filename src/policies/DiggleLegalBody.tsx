import { DIGGLE_DOCS } from './diggleDocuments';
import type { DiggleDocType } from './diggleLegal';

// Plain rendering of a Diggle legal document for the shared policy registry.
// /diggle/* doesn't use this — it renders the same data with the Diggle theme
// in src/diggle/legal/DiggleLegalPage.tsx.
const DiggleLegalBody = ({ type }: { type: DiggleDocType }) => {
  const doc = DIGGLE_DOCS[type];
  return (
    <>
      {doc.lede}
      {doc.summary && (
        <>
          <h2>The short version</h2>
          <ul>
            {doc.summary.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}
      {doc.sections.map((section) => (
        <section key={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          {section.body}
        </section>
      ))}
    </>
  );
};

export default DiggleLegalBody;
