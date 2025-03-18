// Konfigurasi API
const API_CONFIG = {
    TURNME_API_URL: 'https://api.itsrose.rest/turnMe/transform',
    DIFFERENTME_API_URL: 'https://api.itsrose.rest/differentMe/create',
    DIFFERENTME_STATUS_URL: 'https://api.itsrose.rest/differentMe/status',
    API_TOKEN: 'Prod-Sk-8e499dd622744eac3a99ca18adc1d4e5', // API Key Anda
};

// Daftar style untuk TurnMe dan DifferentMe
const TURNME_STYLES = [
    "horrible_zombie", "halloween_makeup", "dark_gothic", "halloween_dark_makeup", "japanese_horror",
    "synthwave_punk", "chocolate_man", "crazy_scientist", "dont_starve", "white_statue",
    "colorful_illustration", "papercut_craft", "blood_of_blue", "cyber_punk", "fanatic_adventure",
    "legend_of_elf", "racer", "cute_cartoon", "super_hero", "pixel_art", "retro_style", "black_swing",
    "fairy_tale", "thick_impasto", "rainbow_hair", "30s_style", "water_magic", "on_fire", "luminous_cloud",
    "pocket_pet", "spirited_wind", "3d_style", "red_redemption", "boxing_man", "hell_kight", "calendar_girl",
    "cute_illustration", "aging_filter", "realistic_fire", "tattoo_magic", "christmas_girl", "ps_game_style_1",
    "thunderstruck_armor", "lightning_punk", "aether_punk", "new_worlds_pirates", "legend_fighters", "barbie_girl",
    "cool_guy", "muscle_man", "blindbox", "melted_chocolate", "block_world", "90s_comic", "realistic_thunderstruck_armor",
    "anime_2d", "realistic_lightning_punk", "white_skin", "hourglass_body_shape", "pixel_style", "anime_hero",
    "christmas_3d", "christmas_family", "cartoon", "80s_style", "christmas_cartoon", "ps_game_style_2", "anime",
    "city_punk", "cartoon_tattoo_muscle", "pocket_pet", "christmas_comic", "magic_muscle", "super_bowl", "romantic_anime",
    "animal_ears", "brick_world", "skeleton_bride", "joker"
];

const DIFFERENTME_STYLES = [
    "animal_fest", "old", "doll", "metal", "8bit", "city", "blazing_torch",
    "clay", "realism", "simulife", "sketch", "zombie", "oil_stick", "balloon",
    "pipe_craft", "crystal", "felt", "jade", "pink_girl", "vivid", "eastern",
    "mythical", "ps2", "pixel_game", "league", "lineage", "fantasy", "gta",
    "persona", "happiness", "manga", "sweet", "pixel_art", "catwoman", "loose",
    "sakura", "pocket", "grains", "graduation", "oil_pastel", "flora_tour", 
    "loong_year", "figure", "prospera", "guardians", "expedition", "leisure", 
    "giftify", "amiable", "3d_cartoon", "sketch_ii", "collage", "mini_doll",
    "sketchresize", "cartoon", "fluffy", "insta", "local_graffiti", "peking_opera",
    "opera", "torch", "sport", "dunk", "idol", "anime25d", "anime", "comic",
    "manhwa", "manhwa_female", "manhwa_male", "samyang"
];

// Elemen DOM
const uploadInput = document.getElementById('image-upload');
const startBtn = document.getElementById('start-btn');
const featureSelection = document.getElementById('feature-selection');
const styleSelection = document.getElementById('style-selection');
const styleList = document.getElementById('style-list');
const resultSection = document.getElementById('result-section');
const resultImages = document.getElementById('result-images');
const loadingSection = document.getElementById('loading');
const downloadBtn = document.getElementById('download-btn');

let selectedImage = null;
let selectedFeature = null;

// Event listener untuk upload gambar
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedImage = file;
        startBtn.disabled = false; // Aktifkan tombol "Mulai"
    }
});

// Event listener untuk tombol "Mulai"
startBtn.addEventListener('click', () => {
    featureSelection.classList.remove('hidden');
});

// Event listener untuk memilih fitur
document.getElementById('turnme-btn').addEventListener('click', () => {
    selectedFeature = 'turnme';
    showStyleList(TURNME_STYLES);
});

document.getElementById('diffme-btn').addEventListener('click', () => {
    selectedFeature = 'diffme';
    showStyleList(DIFFERENTME_STYLES);
});

// Menampilkan daftar style
function showStyleList(styles) {
    featureSelection.classList.add('hidden');
    styleSelection.classList.remove('hidden');
    styleList.innerHTML = styles.map(style => `<button class="style-btn">${style}</button>`).join('');

    // Event listener untuk memilih style
    document.querySelectorAll('.style-btn').forEach(button => {
        button.addEventListener('click', () => {
            const selectedStyle = button.textContent;
            processImage(selectedStyle);
        });
    });
}

// Fungsi untuk mengunggah gambar ke server
async function uploadImageToServer(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.data && data.data.url) {
            const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            return directUrl;
        } else {
            throw new Error('Gagal mengunggah gambar');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Fungsi untuk memproses gambar menggunakan TurnMe API
async function processWithTurnMe(imageUrl, style) {
    try {
        const response = await fetch(API_CONFIG.TURNME_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                init_image: imageUrl,
                style_id: style,
                prompt: "3d realistic, detailed",
                num_image: 1,
            }),
        });

        const data = await response.json();
        if (data.status && data.result.images && data.result.images.length > 0) {
            return data.result.images[0]; // Mengembalikan URL gambar hasil transformasi
        } else {
            throw new Error('Gagal memproses gambar dengan TurnMe: ' + data.message);
        }
    } catch (error) {
        console.error('Error processing with TurnMe:', error);
        throw error;
    }
}

// Fungsi untuk memproses gambar menggunakan DifferentMe API
async function processWithDifferentMe(imageUrl, style) {
    try {
        // Langkah 1: Membuat task
        const createResponse = await fetch(API_CONFIG.DIFFERENTME_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                init_image: imageUrl,
                style_id: style,
                num_image: 1,
            }),
        });

        const createData = await createResponse.json();
        if (!createData.status || !createData.result.task_id) {
            throw new Error('Gagal membuat task di DifferentMe: ' + createData.message);
        }

        const taskId = createData.result.task_id;

        // Langkah 2: Menunggu task selesai
        let statusData;
        do {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Tunggu 3 detik
            const statusResponse = await fetch(`${API_CONFIG.DIFFERENTME_STATUS_URL}?task_id=${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
                },
            });
            statusData = await statusResponse.json();
        } while (statusData.result.status === 'processing');

        if (statusData.result.status === 'completed' && statusData.result.images.length > 0) {
            return statusData.result.images[0]; // Mengembalikan URL gambar hasil transformasi
        } else {
            throw new Error('Gagal memproses gambar dengan DifferentMe: ' + statusData.message);
        }
    } catch (error) {
        console.error('Error processing with DifferentMe:', error);
        throw error;
    }
}

// Fungsi untuk memproses gambar berdasarkan fitur yang dipilih
async function processImage(style) {
    styleSelection.classList.add('hidden');
    resultSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    downloadBtn.classList.add('hidden'); // Sembunyikan tombol unduh saat memproses

    try {
        // Tampilkan pesan loading
        resultImages.innerHTML = `<p>Memproses gambar dengan style: <strong>${style}</strong>...</p>`;

        // Unggah gambar ke server
        const imageUrl = await uploadImageToServer(selectedImage);

        // Proses gambar menggunakan API yang dipilih
        let resultImageUrl;
        if (selectedFeature === 'turnme') {
            resultImageUrl = await processWithTurnMe(imageUrl, style);
        } else if (selectedFeature === 'diffme') {
            resultImageUrl = await processWithDifferentMe(imageUrl, style);
        }

        // Tampilkan hasil
        loadingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        resultImages.innerHTML = `
            <p>Gambar diproses dengan style: <strong>${style}</strong></p>
            <img src="${resultImageUrl}" alt="Processed Image" id="processed-image">
        `;

        // Tampilkan tombol unduh
        downloadBtn.classList.remove('hidden');
        downloadBtn.onclick = () => downloadImage(resultImageUrl); // Setel fungsi unduh
    } catch (error) {
        console.error('Error:', error);
        loadingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        resultImages.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

// Fungsi untuk mengunduh gambar
function downloadImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'hasil_transformasi.jpg'; // Nama file unduhan
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}