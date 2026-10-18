interface CoverArtProps {
  src: string;
  alt: string;
  className?: string;
}

export function CoverArt({ src, alt, className = "" }: CoverArtProps) {
  return <img className={"cover-art " + className} src={src} alt={alt} loading="lazy" />;
}
