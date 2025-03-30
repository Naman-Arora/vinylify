<script lang="ts">
  import {
    Color,
    DoubleSide,
    Material,
    MeshStandardMaterial,
    ShaderMaterial,
    Vector2,
  } from "three";
  import { onMount } from "svelte";
  import { Tween } from "svelte/motion";
  import { quadInOut } from "svelte/easing";
  import { innerWidth } from "svelte/reactivity/window";
  import { T, useTask, useThrelte } from "@threlte/core";
  import { interactivity, ImageMaterial, Text, Suspense } from "@threlte/extras";
  import { degreesToEuler } from "$lib/3d";

  interactivity();

  type Props = {
    topTracks: { imageUrl: string; title: string }[];
  };

  let { topTracks }: Props = $props();

  const PICTURE_BOX_WIDTH = 1.5;
  const PICTURE_TEXT_POS_X = PICTURE_BOX_WIDTH / 2 + 0.001;

  const COLORS = {
    black: new Color("black"),
    white: new Color("white"),
  } as const;

  const { scene } = useThrelte();

  scene.background = COLORS.black;

  const whiteMeshMaterial = new MeshStandardMaterial({ color: COLORS.white });

  class Card {
    title: string;
    imageUrl: string;
    positionX: Tween<number>;
    positionY: Tween<number>;
    positionZ: Tween<number>;
    rotationX: Tween<number>;
    rotationY: Tween<number>;
    rotationZ: Tween<number>;

    constructor(
      imageUrl: string,
      title: string,
      positionX: number,
      positionY: number,
      positionZ: number = 0,
      rotationX: number = 0,
      rotationY: number = 90,
      rotationZ: number = 0,
    ) {
      this.title = title;
      this.imageUrl = imageUrl;
      this.positionX = new Tween(positionX, { easing: quadInOut });
      this.positionY = new Tween(positionY, { easing: quadInOut });
      this.positionZ = new Tween(positionZ, { easing: quadInOut });
      this.rotationX = new Tween(rotationX, { easing: quadInOut });
      this.rotationY = new Tween(rotationY, { easing: quadInOut });
      this.rotationZ = new Tween(rotationZ, { easing: quadInOut });
    }
  }

  const cardGroup = {
    posX: new Tween(0, { easing: quadInOut, duration: 500 }),
    posY: new Tween(0, { easing: quadInOut, duration: 500 }),
    posZ: new Tween(0, { easing: quadInOut, duration: 500 }),
  };

  const camera = {
    posX: new Tween(0, { easing: quadInOut, duration: 500 }),
    posY: new Tween(0.075, { easing: quadInOut, duration: 500 }),
    posZ: new Tween(2.75, { easing: quadInOut, duration: 500 }),
    zoom: new Tween(1, { easing: quadInOut, duration: 500 }),
  };

  let focusedCard = $state<number | null>(null);

  let cards = $state<Card[]>(
    topTracks.map(
      ({ imageUrl, title }, index) => new Card(imageUrl, title, -0.5 + index * 0.175, 0),
    ),
  );

  const gridShaderMaterial = new ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: `
      void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
    uniform float iTime;
    uniform vec2 iResolution;

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;

        vec2 px = 4.0*(-iResolution.xy + 2.0*fragCoord.xy) / iResolution.y;

        float id = 0.5 + 0.5*cos(iTime + sin(dot(floor(px+0.5),vec2(113.1,17.81)))*43758.545);

        vec3 co = 0.5 + 0.5*cos(iTime + 2.0*id + vec3(0.0,1.0,2.0));

        vec2 pa = smoothstep(0.0, 0.2, id*(0.5 + 0.5*cos(6.2831*px)));

        gl_FragColor = vec4(co*pa.x*pa.y, 1.0);
    }
    `,
    side: DoubleSide,
  });

  useTask((delta) => {
    gridShaderMaterial.uniforms.iTime.value += delta;
  });

  let virtualScroll = $state(0);
  // let touchStartY = $state(0);
  let touchStartX = $state(0);

  onMount(() => {
    // Mouse Scroll (Desktop)
    window.addEventListener("wheel", (event) => {
      if (focusedCard !== null) return;
      virtualScroll += event.deltaY;
      cardGroup.posX.set(-virtualScroll * 0.002, { duration: 0 });
    });

    // Touch Drag (Mobile)
    window.addEventListener("touchstart", (event) => {
      if (focusedCard !== null) return;
      // touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
    });

    window.addEventListener("touchmove", (event) => {
      if (focusedCard !== null) return;
      let touchMoveX = event.touches[0].clientX; // Get current touch position
      let deltaX = touchStartX - touchMoveX; // Calculate horizontal movement
      virtualScroll += deltaX * 2; // Adjust sensitivity
      cardGroup.posX.set(-virtualScroll * 0.002, { duration: 0 });
      touchStartX = touchMoveX;
    });

    if ((innerWidth.current || Infinity) < 600) {
      cardGroup.posX.set(0.22, { duration: 0 });
      camera.posY.set(0, { duration: 0 });
    }
  });
</script>

<T.PerspectiveCamera
  makeDefault
  position={[camera.posX.current, camera.posY.current, camera.posZ.current]}
  rotation={degreesToEuler(0, 0, 0)}
  zoom={camera.zoom.current}
/>

<T.AmbientLight color={COLORS.white} intensity={10} />

<T.Mesh name="plane" position={[0, 0, -5]}>
  <T.PlaneGeometry args={[30, 30]} />
  <T is={gridShaderMaterial} />
</T.Mesh>

<!-- Move only scrolling group -->
<Suspense onload={() => {}}>
  <T.Group position={[cardGroup.posX.current, cardGroup.posY.current, cardGroup.posZ.current]}>
    {#each cards as card, i (i)}
      <T.Group
        name={card.title}
        position={[card.positionX.current, card.positionY.current, card.positionZ.current]}
        rotation={degreesToEuler(0, card.rotationY.current, 0)}
        onclick={(e) => {
          e.stopPropagation();
          if (focusedCard !== null && focusedCard !== i) {
            return;
          }
          if (focusedCard === i) {
            card.rotationY.set(90, { duration: 500 });
            camera.zoom.set(1, { duration: 500 });
            card.positionZ.set(0, { duration: 500, delay: 500 });
            cardGroup.posZ.set(0, { duration: 500, delay: 500 });
            focusedCard = null;
            return;
          }
          const dist = PICTURE_BOX_WIDTH + 0.05;
          cardGroup.posZ.set(-dist, { duration: 500 });
          card.positionZ.set(dist, { duration: 500 });
          cardGroup.posX.set(-card.positionX.current, { duration: 500 });
          card.rotationY.set(0, { duration: 500, delay: 500 });
          camera.zoom.set((innerWidth.current || Infinity) < 600 ? 0.75 : 1.5, {
            duration: 1500,
            delay: 500,
          });
          focusedCard = i;
        }}
      >
        <Text
          text={card.title.toUpperCase()}
          fontSize={0.05}
          color="black"
          position={[-PICTURE_TEXT_POS_X, 0, 0]}
          rotation={degreesToEuler(0, -90, -90)}
          anchorX="center"
          anchorY="middle"
          font="https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-400-normal.ttf"
        />
        <T.Mesh
          oncreate={(ref) => {
            let img: Material;
            if (Array.isArray(ref.material)) {
              img = ref.material[0];
            } else {
              img = ref.material;
            }
            ref.material = [
              whiteMeshMaterial,
              whiteMeshMaterial,
              whiteMeshMaterial,
              whiteMeshMaterial,
              img,
              img,
            ];
          }}
        >
          <T.BoxGeometry args={[PICTURE_BOX_WIDTH, PICTURE_BOX_WIDTH, 0.06]} />
          <ImageMaterial attachArray="material" transparent zoom={1} url={card.imageUrl} />
        </T.Mesh>
      </T.Group>
    {/each}
  </T.Group>
</Suspense>
