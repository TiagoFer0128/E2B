import { GridPattern } from '@/components/GridPattern'

export function HeroPattern() {
  return (
    <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
      <div
        className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#FF8800] to-[#F15B03] opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#FF8800]/30 dark:to-[#F15B03]/30 dark:opacity-100">
          <GridPattern
            width={72}
            height={56}
            x={-12}
            y={4}
            squares={[
              [4, 3],
              [2, 1],
              [7, 3],
              [10, 6],
            ]}
            className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:fill-white/2.5 dark:stroke-white/5"
          />
        </div>
        <svg
          width="600"
          height="630"
          viewBox="0 0 600 630"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1023.4 543.117C1015.03 543.117 1009.8 552.179 1013.98 559.429L1101.56 711.11C1106.4 719.501 1098.68 729.56 1089.32 727.052L823.731 655.884C812.128 652.775 800.201 659.661 797.092 671.264L725.925 936.859C723.418 946.218 710.847 947.872 706.003 939.482L618.416 787.772C614.23 780.522 603.765 780.522 599.58 787.772L511.992 939.482C507.148 947.872 494.577 946.218 492.07 936.859L420.903 671.264C417.794 659.661 405.868 652.775 394.265 655.884L128.673 727.052C119.314 729.56 111.596 719.501 116.44 711.11L204.01 559.429C208.196 552.179 202.964 543.117 194.593 543.117L19.4604 543.115C9.7718 543.115 4.91989 531.401 11.7708 524.55L206.2 330.125C214.694 321.631 214.694 307.859 206.2 299.365L11.7709 104.935C4.92002 98.0843 9.7722 86.3703 19.4608 86.3705L194.574 86.3727C202.946 86.3728 208.178 77.3103 203.992 70.0603L116.44 -81.5889C111.596 -89.9796 119.314 -100.038 128.673 -97.5307L394.265 -26.3628C405.868 -23.2537 417.794 -30.1394 420.903 -41.7424L492.07 -307.338C494.577 -316.696 507.148 -318.351 511.992 -309.961L599.579 -158.251C603.765 -151.001 614.23 -151.001 618.415 -158.251L706.002 -309.961C710.847 -318.351 723.417 -316.696 725.925 -307.338L797.092 -41.7424C800.201 -30.1394 812.127 -23.2537 823.73 -26.3628L1089.32 -97.5307C1098.68 -100.038 1106.4 -89.9796 1101.55 -81.5889L1014 70.0603C1009.82 77.3104 1015.05 86.3728 1023.42 86.3727L1198.54 86.3705C1208.23 86.3703 1213.08 98.0843 1206.23 104.935L1011.8 299.365C1003.31 307.859 1003.31 321.631 1011.8 330.125L1206.23 524.55C1213.08 531.401 1208.23 543.115 1198.54 543.115L1023.4 543.117ZM956.559 126.236C964.426 118.368 956.801 105.162 946.054 108.041L709.546 171.416C697.943 174.525 686.016 167.64 682.907 156.036L619.502 -80.5935C616.622 -91.3406 601.373 -91.3407 598.493 -80.5936L535.087 156.036C531.978 167.64 520.052 174.525 508.449 171.416L271.949 108.044C261.202 105.164 253.577 118.37 261.444 126.238L434.574 299.368C443.068 307.862 443.068 321.634 434.574 330.127L261.403 503.294C253.536 511.162 261.161 524.368 271.908 521.489L508.449 458.105C520.052 454.996 531.978 461.882 535.087 473.485L598.493 710.116C601.373 720.863 616.622 720.863 619.502 710.116L682.908 473.485C686.017 461.882 697.943 454.996 709.546 458.105L946.095 521.491C956.842 524.37 964.467 511.164 956.599 503.296L783.427 330.127C774.933 321.634 774.933 307.862 783.427 299.368L956.559 126.236Z"
            fill="url(#paint0_linear_13_7033)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_13_7033"
              x1="609"
              y1="10.0006"
              x2="609"
              y2="692.501"
              gradientUnits="userSpaceOnUse"
            >
              <stop
                stopColor="#333333"
                stopOpacity="0.29"
              />
              <stop
                offset="1"
                stopColor="#333333"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
