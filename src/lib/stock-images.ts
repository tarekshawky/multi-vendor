// Curated, verified-live Unsplash editorial fashion photography.
// Photos without visible third-party brand logos, matching (or grayscale-forced
// into) the Vogue-chic monochrome aesthetic. Reused across seeded demo records.
export const stockImages = {
  heroHome: "https://images.unsplash.com/photo-1574015974293-817f0ebebb74",
  editorialBlazer: "https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf",
  darkPortrait: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  neutralBag: "https://images.unsplash.com/photo-1575403538007-acb790100421",
  boutiqueInterior: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
  whiteDress: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
  tealShoe: "https://images.unsplash.com/photo-1560343090-f0409e92791a",
  portraitMale1: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
  portraitMale2: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
  portraitFemale1: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43",
} as const;

export const productImages = [
  stockImages.darkPortrait,
  stockImages.neutralBag,
  stockImages.whiteDress,
  stockImages.tealShoe,
  stockImages.editorialBlazer,
] as const;

export const avatarImages = [
  stockImages.portraitMale1,
  stockImages.portraitMale2,
  stockImages.portraitFemale1,
] as const;

export function unsplash(url: string, { w, q = 80 }: { w: number; q?: number }) {
  return `${url}?w=${w}&q=${q}&auto=format&fit=crop`;
}
