export interface ImageTemplate {
  id: string;
  title: string;
  category: "Тренды" | "Картинки" | "Motion";
  photo: string;
  prompt: string;
}

export const IMAGE_TEMPLATES: ImageTemplate[] = [
  // ── Тренды ──
  {
    id: "playlist",
    title: "Мой плейлист",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful girl surrounded by floating music album covers, Spotify and Apple Music cards, dark aesthetic background, neon lights, professional photography",
  },
  {
    id: "warrior",
    title: "Тёмный воин",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&h=900&fit=crop&q=85",
    prompt: "Dark warrior woman with weapons, dramatic cinematic lighting, dark fantasy style, epic composition, professional photography",
  },
  {
    id: "cannes",
    title: "Лазурный берег",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=900&fit=crop&q=85",
    prompt: "Elegant woman in Cannes French Riviera, luxury car, summer fashion, golden hour photography, cinematic",
  },
  {
    id: "rose-pool",
    title: "В бассейне из роз",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful woman in a pool filled with rose petals, tropical setting, Bali luxury lifestyle photography, soft light",
  },
  {
    id: "neon-party",
    title: "Неоновая вечеринка",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=700&h=900&fit=crop&q=85",
    prompt: "Woman at neon party with glitter makeup, vibrant purple and pink lights, festival aesthetic, nightlife photography",
  },
  {
    id: "sunset-rooftop",
    title: "Закат на крыше",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful woman on rooftop at golden sunset, city skyline, luxury lifestyle, cinematic photography",
  },
  {
    id: "luxury-car",
    title: "Люкс авто",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=700&h=900&fit=crop&q=85",
    prompt: "Glamorous woman posing with luxury sports car, fashion photography, golden hour, cinematic style",
  },
  {
    id: "ocean-view",
    title: "Океанский закат",
    category: "Тренды",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=900&fit=crop&q=85",
    prompt: "Woman on tropical beach at sunset, crystal clear ocean, luxury resort, professional lifestyle photography",
  },

  // ── Картинки ──
  {
    id: "met-gala",
    title: "Met Gala образ",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&h=900&fit=crop&q=85",
    prompt: "Stunning woman in elaborate Met Gala fashion dress, red carpet photography, haute couture, artistic makeup, editorial style",
  },
  {
    id: "mirror-selfie",
    title: "Зеркальное селфи",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&h=900&fit=crop&q=85",
    prompt: "Fashion girl taking mirror selfie, aesthetic room, trendy outfit, perfect lighting, high quality photography",
  },
  {
    id: "formula1",
    title: "Формула 1",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=900&fit=crop&q=85",
    prompt: "Glamorous woman at Formula 1 race, pit lane, sports fashion, professional photography, luxury",
  },
  {
    id: "studio",
    title: "Студийный портрет",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=700&h=900&fit=crop&q=85",
    prompt: "Professional studio portrait, dramatic lighting, high fashion photography, editorial style, clean background",
  },
  {
    id: "fashion-week",
    title: "Неделя моды",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&h=900&fit=crop&q=85",
    prompt: "Fashion week runway model, avant-garde outfit, professional fashion photography, editorial, dramatic lighting",
  },
  {
    id: "bali-villa",
    title: "Вилла на Бали",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=900&fit=crop&q=85",
    prompt: "Luxury woman at Bali villa, infinity pool, tropical jungle, resort lifestyle photography, golden hour",
  },
  {
    id: "paris-chic",
    title: "Парижский шик",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=700&h=900&fit=crop&q=85",
    prompt: "Elegant woman in Paris, Eiffel Tower background, chic french fashion, street photography, cinematic",
  },
  {
    id: "dubai-luxury",
    title: "Дубай люкс",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&h=900&fit=crop&q=85",
    prompt: "Glamorous woman in Dubai, Burj Khalifa view, luxury hotel rooftop, fashion photography, desert sunset",
  },
  {
    id: "spring-flowers",
    title: "Весна в цветах",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful woman surrounded by spring flowers, cherry blossoms, pastel aesthetic, soft natural lighting, fashion photography",
  },
  {
    id: "night-city",
    title: "Ночной город",
    category: "Картинки",
    photo: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=700&h=900&fit=crop&q=85",
    prompt: "Woman in night city, rain reflections, city lights bokeh, cinematic street photography, moody atmosphere",
  },

  // ── Motion ──
  {
    id: "cyberpunk",
    title: "Киберпанк",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1518688248740-7c31f1a945c4?w=700&h=900&fit=crop&q=85",
    prompt: "Cyberpunk girl in futuristic city, neon lights, rain, holographic elements, cinematic photography",
  },
  {
    id: "anime",
    title: "Аниме арт",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&h=900&fit=crop&q=85",
    prompt: "Anime style digital illustration, beautiful female character, vibrant colors, professional digital art, detailed",
  },
  {
    id: "fire-queen",
    title: "Королева огня",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1542596081-6d3eaca5240c?w=700&h=900&fit=crop&q=85",
    prompt: "Powerful woman surrounded by fire and flames, fantasy queen, dramatic lighting, epic digital art, cinematic",
  },
  {
    id: "space-girl",
    title: "Космическая девушка",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful woman in space, stars and galaxies, futuristic suit, cosmic aesthetic, digital art, cinematic",
  },
  {
    id: "magic-forest",
    title: "Волшебный лес",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&h=900&fit=crop&q=85",
    prompt: "Mystical woman in magical glowing forest, fairy lights, enchanted nature, fantasy photography, ethereal",
  },
  {
    id: "angel-wings",
    title: "Ангельские крылья",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=700&h=900&fit=crop&q=85",
    prompt: "Beautiful woman with large angel wings, divine light, golden ethereal atmosphere, fantasy digital art",
  },
  {
    id: "underwater",
    title: "Под водой",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=700&h=900&fit=crop&q=85",
    prompt: "Stunning woman underwater, flowing hair, crystal blue water, magical underwater photography, surreal",
  },
  {
    id: "neon-portrait",
    title: "Неоновый портрет",
    category: "Motion",
    photo: "https://images.unsplash.com/photo-1525373698358-041e3a460346?w=700&h=900&fit=crop&q=85",
    prompt: "Close up portrait with neon color lights, vibrant colors, artistic double exposure, surreal photography",
  },
];
