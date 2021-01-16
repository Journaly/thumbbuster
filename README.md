# Thumbbuster

![logo](logo.png)

## Dependencies

Sharp has binaries, make sure that if you change the sharp dep or regenerate package-lock.json you do so with:

```
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux
```

so that everything remains deployable.
