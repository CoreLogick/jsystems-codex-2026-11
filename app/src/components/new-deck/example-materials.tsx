import Image from "next/image";

import type { Dictionary } from "@/i18n/dictionaries";

const images = [
  { file: "phone-1.jpg", alt: "Phone with a damaged screen" },
  { file: "phone-2.jpeg", alt: "Blue phone held in one hand" },
  { file: "phone-3.jpeg", alt: "Phone and packaging on a desk" },
  { file: "laptop-1.png", alt: "Laptop with a damaged display" },
  { file: "laptop-2.webp", alt: "Laptop prepared for a vocabulary exercise" },
];

export function ExampleMaterials({ dictionary }: { dictionary: Dictionary }) {
  return (
    <aside className="examples-card" aria-labelledby="examples-title">
      <div>
        <p className="section-kicker">{dictionary.photoCount}</p>
        <h2 id="examples-title">{dictionary.examplesTitle}</h2>
        <p>{dictionary.examplesDescription}</p>
      </div>
      <div className="photo-strip">
        {images.map((image) => (
          <div className="photo-frame" key={image.file}>
            <Image alt={image.alt} fill sizes="(max-width: 960px) 30vw, 100px" src={`/example-images/${image.file}`} />
          </div>
        ))}
      </div>
    </aside>
  );
}
