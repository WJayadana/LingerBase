from pathlib import Path

from PIL import Image

from manga_cli.mask.generator import MaskGenerator
from manga_cli.types import BoundingBox, OcrBlock


def test_mask_generator_marks_ocr_box(tmp_path: Path) -> None:
    image = tmp_path / "page.png"
    mask = tmp_path / "mask.png"
    Image.new("RGB", (20, 20), "white").save(image)

    MaskGenerator(padding=2).generate(
        image, [OcrBlock("hi", BoundingBox(5, 5, 5, 5))], mask
    )

    with Image.open(mask) as result:
        assert result.getpixel((4, 4)) == 255
        assert result.getpixel((0, 0)) == 0
