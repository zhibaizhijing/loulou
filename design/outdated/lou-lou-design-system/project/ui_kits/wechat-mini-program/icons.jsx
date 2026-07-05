// Lou Lou — Iconography (Phosphor)
// Thin React wrappers around the Phosphor web font.
// Requires the Phosphor CSS to be loaded in the page:
//   https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css
//   https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css

const PhIcon = ({ name, size = 24, weight = 'regular', color }) => (
  <i
    className={`${weight === 'fill' ? 'ph-fill' : 'ph'} ph-${name}`}
    style={{ fontSize: size, lineHeight: 1, color, display: 'inline-flex' }}
    aria-hidden
  />
);

// Regular (stroke) — chrome / inactive tabs
const Iback     = (p) => <PhIcon name="caret-left"           {...p} />;
const Ichevron  = (p) => <PhIcon name="caret-right"          {...p} />;
const Isearch   = (p) => <PhIcon name="magnifying-glass"     {...p} />;
const Ibell     = (p) => <PhIcon name="bell"                 {...p} />;
const Ihome     = (p) => <PhIcon name="house"                {...p} />;
const Ipaw      = (p) => <PhIcon name="paw-print"            {...p} />;
const Icalendar = (p) => <PhIcon name="calendar-blank"       {...p} />;
const Iuser     = (p) => <PhIcon name="user"                 {...p} />;
const Iarrow    = (p) => <PhIcon name="arrow-up-right"       {...p} />;
const Ichart    = (p) => <PhIcon name="chart-bar"            {...p} />;
const Iplus     = (p) => <PhIcon name="plus"                 {...p} />;
const Iclose    = (p) => <PhIcon name="x"                    {...p} />;
const Imap      = (p) => <PhIcon name="map-pin"              {...p} />;
const Iclock    = (p) => <PhIcon name="clock"                {...p} />;
const Iheart    = (p) => <PhIcon name="heart"                {...p} />;

// Filled — active tab states
const IhomeFill     = (p) => <PhIcon name="house"          weight="fill" {...p} />;
const IpawFill      = (p) => <PhIcon name="paw-print"      weight="fill" {...p} />;
const IcalendarFill = (p) => <PhIcon name="calendar-blank" weight="fill" {...p} />;
const IuserFill     = (p) => <PhIcon name="user"           weight="fill" {...p} />;

// Star — kept as small inline SVG so we can tint it (Phosphor color = currentColor)
const Istar = ({ size = 12, color = '#F0B100' }) => (
  <i
    className="ph-fill ph-star"
    style={{ fontSize: size, lineHeight: 1, color, display: 'inline-flex' }}
    aria-hidden
  />
);

Object.assign(window, {
  PhIcon,
  Iback, Ichevron, Isearch, Ibell, Ihome, IhomeFill,
  Ipaw, IpawFill, Icalendar, IcalendarFill, Iuser, IuserFill,
  Iarrow, Ichart, Iplus, Iclose, Imap, Iclock, Iheart, Istar,
});
