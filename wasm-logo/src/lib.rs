use wasm_bindgen::prelude::*;
use image::{ImageOutputFormat, DynamicImage, imageops::FilterType};
use std::io::Cursor;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use ravif::{Encoder, Img, RGBA8};
use rgb::FromSlice;

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

/// Compress to AVIF with near-lossless quality (CQ 20)
#[wasm_bindgen]
pub fn compress_to_avif(image_data: &[u8], is_jewelry: bool, max_height: u32) -> Result<String, JsValue> {
    // Decode image
    let mut img = image::load_from_memory(image_data)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    // Resize
    let current_h = img.height();
    if current_h > max_height {
        let ratio = max_height as f32 / current_h as f32;
        let new_w = (img.width() as f32 * ratio) as u32;
        // Lanczos3 is the highest quality resampling filter to prevent blurring during resize!
        img = img.resize(new_w, max_height, FilterType::Lanczos3);
    }

    if is_jewelry {
        img.invert();
    }

    let rgba = img.to_rgba8();
    let width = rgba.width() as usize;
    let height = rgba.height() as usize;

    // We use a high quality setting (quality = 90) to prevent any quality drop!
    let encoder = Encoder::new()
        .with_quality(90.0)
        .with_speed(4); // Speed 4 is a good balance for WASM

    // We wrap the raw bytes in ravif Img struct
    let ravif_img = Img::new(rgba.as_raw().as_rgba(), width, height);
    
    // Encode to AVIF
    let avif_data = encoder.encode_rgba(ravif_img)
        .map_err(|e| JsValue::from_str(&format!("AVIF encoding failed: {}", e)))?;

    // Base64 encode for direct frontend usage
    let base64_str = BASE64.encode(avif_data.avif_file);
    Ok(format!("data:image/avif;base64,{}", base64_str))
}
