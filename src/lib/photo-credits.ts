// Kredit foto berlisensi untuk gambar sampul kategori/kota/provinsi (public/media/local-wisdom/{key}-wide.webp).
// Semua dari Wikimedia Commons (CC BY / CC BY-SA / domain publik). Diunduh & dikonversi ke WebP 26 Nov 2026.
// Foto artikel dikreditkan di masing-masing artikel (hero_credit + hero_credit_url).
import type { GuideImage } from './local-guide';

export type PhotoCredit = { title: string; author: string; license: string; licenseUrl: string; source: string };

export const photoCredits: Record<GuideImage, PhotoCredit> = {
  "bromo": { title: "Kaldera Tengger dengan Gunung Bromo, Batok, dan Semeru di latar belakang", author: "Jakub Hałun", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Bromo,_Semeru,_Batok_-_view_of_Tengger_caldera,_East_Java,_Indonesia,_20220820_0709_9507.jpg" },
  "malang": { title: "Monumen Tugu Kota Malang di Alun-Alun Tugu", author: "Ulumarifah", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Tugu_Kota_Malang_(3).jpg" },
  "batu": { title: "Pemandangan Kota Batu dilihat dari Museum Angkut", author: "Ya, saya inBaliTimur", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0", source: "https://commons.wikimedia.org/wiki/File:Kota_Batu_Panorama_(35062670326).jpg" },
  "surabaya": { title: "Tugu Pahlawan, Surabaya", author: "Eny Santiati", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Tugu_Pahlawan_Surabaya_Jawa_Timur.jpg" },
  "rawon": { title: "Seporsi nasi rawon di Rawon Nguling, Probolinggo", author: "ESCapade", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Nasi_Rawon_B.JPG" },
  "hotel": { title: "Contoh kamar hotel (foto ilustrasi)", author: "Allvin Garamar", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:EXECUTIVE_ROOM_-_Teraskita_Hotel_Makassar.jpg" },
  "tugu": { title: "Kawasan Alun-Alun Tugu Malang di depan Balai Kota", author: "Christophe95", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Alun-Alun_Tugu_1.jpg" },
  "bakso": { title: "Semangkuk bakso Malang dengan pangsit goreng (foto ilustrasi)", author: "Gunawan Kartapranata", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Baso_Malang_Karapitan.JPG" },
  "jatim": { title: "Paviliun pintu masuk Batu Secret Zoo di kawasan Jatim Park 2, Kota Batu", author: "Rochelimit", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Batu_Secret_Zoo_entrance_pavilion.jpg" },
  "gudeg": { title: "Deretan rumah makan gudeg di Sentra Gudeg Wijilan, Yogyakarta", author: "Dietrich Ayala from Portland, USA", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0", source: "https://commons.wikimedia.org/wiki/File:Sentra_Gudeg_Wijilan.jpg" },
  "mojokerto": { title: "Gapura Bajang Ratu peninggalan Majapahit di Trowulan, Mojokerto", author: "Ivuvisual", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Candi_Bajang_Ratu.jpg" },
  "pasuruan": { title: "Masjid Agung Al-Anwar dekat Alun-Alun Kota Pasuruan", author: "Gunarta", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Masjid_Agung_Pasuruan.jpg" },
  "bangil": { title: "Alun-Alun Bangil, Kabupaten Pasuruan, pada malam hari", author: "Government of East Java", license: "Public domain", licenseUrl: "", source: "https://commons.wikimedia.org/wiki/File:Alun_alun_Bangil_Pasuruan_di_malam_hari.jpg" },
  "blitar": { title: "Candi Penataran di Nglegok, Kabupaten Blitar", author: "Pandu Aji Wirawan", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Bangunan_Utama_Candi_Penataran_di_Blitar.jpg" },
  "kediri": { title: "Gunung Kelud di perbatasan Kabupaten Kediri", author: "GusJuned", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Gunung_Kelud_(Kelud_Mountain)_-_panoramio.jpg" },
  "lumajang": { title: "Air Terjun Tumpak Sewu di Kabupaten Lumajang", author: "Irsam24", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Air_rerjun_Tumpak_Sewu.jpg" },
  "jember": { title: "Pantai Papuma, Kabupaten Jember", author: "Herreads", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0", source: "https://commons.wikimedia.org/wiki/File:Laut_Pantai_Papuma_Jember.jpg" },
  "solo": { title: "Pendapa Agung Pura Mangkunegaran, Surakarta", author: "Crisco 1492", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Grand_Pendopo,_Mangkunegaran_Palace.jpg" },
  "magelang": { title: "Candi Borobudur dilihat dari barat laut, Kabupaten Magelang", author: "Gunawan Kartapranata", license: "Domain publik", licenseUrl: "https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg", source: "https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg" },
  "bandung": { title: "Gedung Sate, kantor Gubernur Jawa Barat di Kota Bandung", author: "Gunawan Kartapranata", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0", source: "https://commons.wikimedia.org/wiki/File:Gedung_Sate_Bandung.jpg" },
  "jakarta": { title: "Monumen Nasional (Monas) di Medan Merdeka, Jakarta Pusat", author: "Ramayoni", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:Monumen_Nasional,_Jakarta,_Indonesia.jpg" },
};

export const photoCreditText = (key: GuideImage) => { const c = photoCredits[key]; return `Foto: ${c.author} / Wikimedia Commons, ${c.license}`; };

/** Foto artikel (public/media/articles/…), dikreditkan juga di /kredit-foto/. */
export type ArticlePhotoCredit = PhotoCredit & { src: string; width: number; height: number };

export const articlePhotoCredits: ArticlePhotoCredit[] = [
  {
    src: '/media/articles/candi-borobudur-magelang-pelataran-tangga-utama.jpg',
    width: 1600,
    height: 1064,
    title: 'Pelataran dan tangga utama Candi Borobudur, Kabupaten Magelang',
    author: 'Andrew Otto',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    source: 'https://commons.wikimedia.org/wiki/File:Borobudur_grounds.jpg',
  },
  {
    src: '/media/articles/candi-borobudur-magelang-stupa-berlubang.jpg',
    width: 1600,
    height: 1045,
    title: 'Stupa berlubang di kompleks Candi Borobudur, Kabupaten Magelang',
    author: 'CEphoto, Uwe Aranas',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Borobudur-Temple-Park_Indonesia_Stupas-of-Borobudur-01.jpg',
  },
  {
    src: '/media/articles/candi-borobudur-magelang-arca-buddha-stupa.jpg',
    width: 1600,
    height: 1116,
    title: 'Arca Buddha di dalam stupa Candi Borobudur, Kabupaten Magelang',
    author: 'Philip Nalangan',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Borobudur_Indonesia_4.jpg',
  },
  {
    src: '/media/articles/candi-wringin-lawang-mojokerto-gapura-bentar.jpg',
    width: 1200,
    height: 1600,
    title: 'Gapura bentar Candi Wringin Lawang di Trowulan, Kabupaten Mojokerto',
    author: 'Risanprasetyo/Febri Ady Prasetyo',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Gapura_Wringin_Lawang_di_Trowulan.jpg',
  },
  {
    src: '/media/articles/petirtaan-jolotundo-mojokerto-kolam-pancuran.jpg',
    width: 1280,
    height: 853,
    title: 'Kolam pancuran Petirtaan Jolotundo, Kabupaten Mojokerto',
    author: 'Ivuvisual',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Candi_Jolotundo.jpg',
  },
  {
    src: '/media/articles/maha-vihara-majapahit-mojokerto-buddha-tidur.jpg',
    width: 1280,
    height: 853,
    title: 'Buddha tidur di Maha Vihara Majapahit, Trowulan, Kabupaten Mojokerto',
    author: 'Anandajoti Bhikkhu',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    source: 'https://commons.wikimedia.org/wiki/File:023_Reclining_Buddha_(38656061860).jpg',
  },
  {
    src: '/media/articles/air-terjun-madakaripura-probolinggo.jpg',
    width: 1200,
    height: 1600,
    title: 'Air Terjun Madakaripura, Kabupaten Probolinggo',
    author: 'Yyp1607',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Air_Terjun_Madakaripura_Probolinggo.jpg',
  },
  {
    src: '/media/articles/air-terjun-kapas-biru-lumajang.jpg',
    width: 1069,
    height: 1600,
    title: 'Air Terjun Kapas Biru, Kabupaten Lumajang',
    author: 'Irfnrmdhan',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Kapas_Biru_Waterfall,_Lumajang,_East_Java.jpg',
  },
];
