### Usage and Override

```scss
@import "~@ptsecurity/mosaic/theming";

// returns default typography config
$typography: mc-typography-config();
//If you need to get font size of mosaic small-text and don`t want to use .mc-small-text class
.some-selector {
    font-size: mc-font-size($typography, small-text);
}
```

#### Partial config override
```scss
//mc-typography-level($font-size, $line-height: $font-size, $letter-spacing: normal, $font-weight: normal, $font-family: null, $text-transform: null)
$typography: mc-typography-config($body: mc-typography-level(45px, 45px, 0.55px));
```

#### Full config override
```scss
$fonts: (
    base: (
        font-family: #{Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif}
    ),
    monospace: (
        font-family: #{'Roboto Mono', 'Consolas', 'Menlo', 'Monaco', monospace}
    )
);

$font-family:   map-get(map-get($fonts, base), font-family);
$font-family-mono:   map-get(map-get($fonts, monospace), font-family);

$typography: mc-typography-config(
    $font-family,
    $font-family-mono,
    $display-1:         mc-typography-level(56px, 76px, -0.4px),
    $display-2:         mc-typography-level(45px, 56px),
    $display-3:         mc-typography-level(34px, 44px, 0.25px),

    $headline:          mc-typography-level(24px, 32px),
    $title:             mc-typography-level(20px, 28px, 0.15px, 500),
    $subheading:        mc-typography-level(15px, 20px, 0.15px, 500),

    $body:              mc-typography-level(45px, 20px, 0.55px),
    $body-strong:       mc-typography-level(15px, 20px, 0.15px, 500),
    $body-caps:         mc-typography-level(15px, 20px, 1.7px, normal, $font-family, uppercase),
    $body-mono:         mc-typography-level(15px, 20px, normal, normal, $font-family-mono),

    $caption:           mc-typography-level(13px, 16px, 0.25px),
    $caption-caps:      mc-typography-level(13px, 16px, 1.5px, normal, $font-family, uppercase),
    $caption-mono:      mc-typography-level(13px, 16px, normal, normal, $font-family-mono),

    $small-text:        mc-typography-level(13px, 16px, 0.25px),
    $extra-small-text:  mc-typography-level(11px, 16px, 0.22px)
);

```

After override we need to apply changed config to all elements

```scss
@include mosaic-typography($typography);
```
