export const categories = [
  { label: 'عطور', aliases: ['عطور', 'عطر', 'برفانات', 'perfume', 'perfumes'] },
  { label: 'زيوت عطرية', aliases: ['زيوت عطرية', 'زيوت', 'زيت عطري', 'oils'] },
  { label: 'بخور', aliases: ['بخور', 'عود وبخور', 'incense'] },
  { label: 'ساعات', aliases: ['ساعات', 'ساعة', 'watches'] },
  { label: 'نضارات', aliases: ['نضارات', 'نظارات', 'نظارات شمسية', 'نضارات شمسية', 'sunglasses'] },
  { label: 'أدوات صناعة العطور', aliases: ['أدوات صناعة العطور', 'ادوات صناعة العطور', 'أدوات تركيب العطور'] },
];

export const socials = {
  whatsapp: 'https://wa.me/201068828900',
};
export const original = '/original/index.html';
export const money = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 });
export const price = (value) => money.format(Number(value) || 0) + ' جنيه';
socials.facebook = 'https://www.facebook.com/profile.php?id=61583522579606';
socials.instagram = 'https://www.instagram.com/monsela_luxuryperfumes/';
