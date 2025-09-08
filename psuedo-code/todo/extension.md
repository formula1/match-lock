
# Prevent .match-lock.json Extensions from Being Used
At the moment we track asset types based on a file's extension.
JSON is a relatively common extension and we should not prevent it from being used.
However, anything named `match-lock.json` or ends with `.match-lock.json` should not be allowed.


# Longer Extensions
At the moment, assetTypes are based on the file's extension
This is fine as some assets are custom made for games and have no mimetype

However, some assets may have the same extension but serve different purposes
For example, `*.json` files can serve a variety of purpose
- game logic
- match-lock validation
- Can define an animated svg

As a result, we should allow a longer extension to be define so that we can tell the difference
- `*.animation.json` as a media type
- `*.weapon.json` as a logic type


# Mutliple Extensions used for same purpose
Some assets may use multiple extensions to represent the same type
For example, `*.png` and `*.webp` are both image types

We should allow multiple extensions to be defined for the same asset type.
