<script setup>
import { onMounted, ref } from "vue";
import { computed } from "vue";
const props = defineProps({
  profile_data: Object,
  loadProfile: Function,
});
const current_bmi = ref(0);

const calculateBMI = () => {
  const height = props.profile_data.height / 100; // convert cm to meters
  current_bmi.value = (props.profile_data.weight / (height * height)).toFixed(
    2,
  );
};

const cx = 200;
const cy = 210;
const rOuter = 185;
const rInner = 115;

// gaugeAngle: 0 = leftmost point, 180 = rightmost point, 90 = top of the arc.
function polarToCartesian(cx, cy, r, gaugeAngle) {
  const std = Math.PI * (1 - gaugeAngle / 180);
  return { x: cx + r * Math.cos(std), y: cy - r * Math.sin(std) };
}

function describeWedge(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    "M",
    outerStart.x,
    outerStart.y,
    "A",
    rOuter,
    rOuter,
    0,
    largeArc,
    1,
    outerEnd.x,
    outerEnd.y,
    "L",
    innerEnd.x,
    innerEnd.y,
    "A",
    rInner,
    rInner,
    0,
    largeArc,
    0,
    innerStart.x,
    innerStart.y,
    "Z",
  ].join(" ");
}

function describeArcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const segments = [
  {
    key: "under",
    label: "UNDERWEIGHT",
    range: "< 18.5",
    color: "#29ABE2",
    from: 0,
    to: 36,
    bmiFrom: 0,
    bmiTo: 18.5,
  },
  {
    key: "normal",
    label: "NORMAL",
    range: "18.5 – 24.9",
    color: "#39B54A",
    from: 36,
    to: 72,
    bmiFrom: 18.5,
    bmiTo: 24.9,
  },
  {
    key: "over",
    label: "OVERWEIGHT",
    range: "25.0 – 29.9",
    color: "#FBB040",
    from: 72,
    to: 108,
    bmiFrom: 25,
    bmiTo: 29.9,
  },
  {
    key: "obese",
    label: "OBESE",
    range: "30.0 – 39.9",
    color: "#F7941E",
    from: 108,
    to: 144,
    bmiFrom: 30,
    bmiTo: 39.9,
  },
  {
    key: "severe",
    label: "SEVERELY OBESE",
    range: "≥ 40.0",
    color: "#ED1C24",
    from: 144,
    to: 180,
    bmiFrom: 40,
    bmiTo: 60,
  },
];

const wedges = segments.map((s, i) => ({
  ...s,
  path: describeWedge(cx, cy, rOuter, rInner, s.from + 1, s.to - 1),
  labelArcId: `label-arc-${i}`,
  labelArcPath: describeArcPath(
    cx,
    cy,
    (rOuter + rInner) / 2 + 22,
    s.from + 4,
    s.to - 4,
  ),
  rangeArcId: `range-arc-${i}`,
  rangeArcPath: describeArcPath(
    cx,
    cy,
    (rOuter + rInner) / 2 - 14,
    s.from + 4,
    s.to - 4,
  ),
}));

function bmiToAngle(bmi) {
  const clampedBmi = Math.max(0, Math.min(bmi, 60));
  for (const s of segments) {
    if (clampedBmi <= s.bmiTo) {
      const t = (clampedBmi - s.bmiFrom) / (s.bmiTo - s.bmiFrom);
      return s.from + t * (s.to - s.from);
    }
  }
  return 180;
}

const needleAngle = computed(() => bmiToAngle(current_bmi.value));

const needlePoints = computed(() => {
  const len = rInner - 12;
  const baseR = 11;
  const tip = polarToCartesian(cx, cy, len, needleAngle.value);
  const std = Math.PI * (1 - needleAngle.value / 180);
  const b1 = {
    x: cx + baseR * Math.cos(std + Math.PI / 2),
    y: cy - baseR * Math.sin(std + Math.PI / 2),
  };
  const b2 = {
    x: cx + baseR * Math.cos(std - Math.PI / 2),
    y: cy - baseR * Math.sin(std - Math.PI / 2),
  };
  return `${b1.x},${b1.y} ${tip.x},${tip.y} ${b2.x},${b2.y}`;
});

onMounted(async () => {
  await props.loadProfile();
  calculateBMI();
  console.log("BMI ", props?.profile_data.height);
});
</script>

<template>
  <div>
    <div class="w-full mt-4 -mb-3">
      <p class="text-xs text-[#d76821] italic font-bold">Your Current BMI</p>
    </div>
    <!-- CONTAINER -->
    <div class="content-container bg-white/60 mt-4">
      <div class="w-full text-center pt-2">
        <span class="font-bold"> BMI {{ current_bmi }} </span>
      </div>
      <div class="w-full max-w-xl mx-auto -mt-4">
        <svg viewBox="0 0 400 260" class="w-full">
          <g v-for="(w, i) in wedges" :key="w.key">
            <path :d="w.path" :fill="w.color" />

            <path
              :id="w.labelArcId"
              :d="w.labelArcPath"
              fill="none"
              stroke="none"
            />
            <text
              font-size="13"
              font-weight="700"
              fill="#ffffff"
              letter-spacing="0.5"
              style="text-transform: uppercase"
            >
              <textPath
                :href="'#' + w.labelArcId"
                startOffset="50%"
                text-anchor="middle"
              >
                {{ w.label }}
              </textPath>
            </text>

            <path
              :id="w.rangeArcId"
              :d="w.rangeArcPath"
              fill="none"
              stroke="none"
            />
            <text font-size="12" font-weight="600" fill="#ffffff">
              <textPath
                :href="'#' + w.rangeArcId"
                startOffset="50%"
                text-anchor="middle"
              >
                {{ w.range }}
              </textPath>
            </text>
          </g>
          <polygon :points="needlePoints" fill="#3a3a3a" />
          <circle
            :cx="cx"
            :cy="cy"
            r="17"
            fill="#ffffff"
            stroke="#3a3a3a"
            stroke-width="8"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
