# Image drop folder

Place the final artwork here using these exact filenames — the code already
references them.

| File            | Used by                     | Recommended size | Notes                                                                 |
| --------------- | --------------------------- | ---------------- | --------------------------------------------------------------------- |
| `about-bg.png`  | About section background    | 2400 × 1600      | Gets a navy overlay at ~82% and parallax drift; keep the subject centred and avoid text in the image. |
| `services1.png` | Customs Brokerage           | 1200 × 900 (4:3) | Bottom ~35% is covered by a gradient and chips.                        |
| `services2.png` | Customs Clearing & Facilitation | 1200 × 900   |                                                                       |
| `services3.png` | Distribution & Delivery     | 1200 × 900       |                                                                       |
| `services4.png` | Warehousing                 | 1200 × 900       |                                                                       |
| `services5.png` | Facility Usage              | 1200 × 900       |                                                                       |
| `services6.png` | Single Consignee Shipment   | 1200 × 900       |                                                                       |
| `services7.png` | Cargo Marine Insurance      | 1200 × 900       |                                                                       |

The order of `services1–7` matches the order of the `services` array in
[`lib/content.ts`](../../lib/content.ts). If the order changes there, update the
`image` field rather than renaming files.

`next/image` converts these to WebP/AVIF and serves responsive sizes
automatically, so ship the highest-quality source you have rather than
pre-compressing.
