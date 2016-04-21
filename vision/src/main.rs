
extern crate image;

use std::path::Path;
use std::env;

use image::{
  GenericImage,
  Pixel
};

fn main() {
  let piano_image: String = match env::args().nth(1) {
    Some(piano_image) => piano_image,
    None              => panic!("No image file specified")
  };

  let img = image::open(&Path::new(&piano_image)).unwrap();

  let (width, height) = img.dimensions();
  let cell_width = width / 4;
  let vertical_line_offset = cell_width / 2;

  let mut touches_vec: Vec<(u32, u32)> = Vec::new();

  for col in 0..4 {
    let mut start_height = 0;
    let mut end_height = 0;
    for row in 0..height {
      let current_x = (col * cell_width) + vertical_line_offset;
      let current_y = row;
      let pixel = img.get_pixel(current_x, current_y);
      let luma_pixel = pixel.to_luma();

      // println!("row: {:?} - data {:?}", current_y, luma_pixel.data[0]);

      if luma_pixel.data[0] < 30 {
        if start_height == 0 {
          // println!("setting start height {:?}", row);
          start_height = row;
        }
      }
      if start_height != 0 {
        if luma_pixel.data[0] < 50 {
          end_height = row;
        }
        if end_height != row || row == height - 1 {
          touches_vec.push((current_x, current_y - ((end_height - start_height) / 4)));
          if (end_height - start_height) > 80 {
            if (end_height - start_height) < (height/3) {
              println!("{:?},{:?}", current_x, current_y - ((end_height - start_height) / 6));
            }
          }
          start_height = 0;
          end_height = 0;
        }
      }
    }
  }
}
