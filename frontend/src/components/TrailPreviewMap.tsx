import { getTrailCoverImage, type TrailPathSource } from '../lib/knownTrailPaths';

interface TrailPreviewMapProps {
  trail: TrailPathSource;
}

export default function TrailPreviewMap({ trail }: TrailPreviewMapProps) {
  const coverImage = getTrailCoverImage(trail);

  return (
    <div className="h-44 relative overflow-hidden bg-[#18231f]">
      <img
        src={coverImage}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
    </div>
  );
}
