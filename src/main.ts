/**
 * Augmented Reality template using encantar.js
 * @author Alexandre Martins <alemartf(at)gmail.com> (https://github.com/alemart/encantar-js)
 */

import type { SpeedyMatrix } from "speedy-vision";
import { AR } from "./encantar-js/main";
import type { ImageTrackerEvent } from "./encantar-js/trackers/image-tracker/image-tracker-event";
import type { Frame } from "./encantar-js/core/frame";
import { Viewer } from "./encantar-js/geometry/viewer";
import type { Pose } from "./encantar-js/geometry/pose";
import type {
  TrackerResult as DTrackerResult,
  Tracker,
} from "./encantar-js/trackers/tracker";
import Speedy from "speedy-vision";

interface Trackable {
  readonly tracker: Tracker;
  pose: Pose; // pose is missing in original interface
}

interface TrackerResult extends DTrackerResult {
  viewer: Viewer; // viewer is missing in original interface
  trackables: Trackable[];
}

const dot = document.getElementById("dot")!;

let targetFoundAt = Infinity;

const showDot = (x: number, y: number) => {
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.display = "block";
};

const hideDot = () => {
  dot.style.left = window.innerWidth / 2 + "px";
  dot.style.top = window.innerHeight / 2 + "px";
  dot.style.display = "none";
};

const updateStatus = (statusType: "found" | "searching", message?: string) => {
  const status = document.getElementById("status")!;
  if (statusType === "found") {
    status.classList.add("status--found");
    status.textContent = message || "Target found!";
  }
  if (statusType === "searching") {
    status.classList.remove("status--found");
    status.textContent = message || "Searching for target...";
  }
};

/**
 * Start the AR session
 * @returns {Promise<Session>}
 */
async function startARSession() {
  if (!AR.isSupported()) {
    throw new Error(
      "This device is not compatible with this AR experience.\n\n" +
        "User agent: " +
        navigator.userAgent
    );
  }

  hideDot();
  const tracker = AR.Tracker.Image({
    resolution: "sm",
  });
  await tracker.database.add([
    {
      name: "dog",
      image: document.getElementById("dog") as HTMLImageElement,
    },
    {
      name: "cat",
      image: document.getElementById("cat") as HTMLImageElement,
    },
  ]);

  const viewport = AR.Viewport({
    style: "stretch",
    container: document.getElementById("ar-viewport") as HTMLDivElement,
    hudContainer: document.getElementById("ar-hud") as HTMLDivElement,
  });

  const aspectRatio =
    window.innerWidth < window.innerHeight
      ? window.innerHeight / window.innerWidth
      : window.innerWidth / window.innerHeight;

  const source = AR.Source.Camera({
    aspectRatio: aspectRatio,
    resolution: "lg",
  });

  const session = await AR.startSession({
    mode: "immersive",
    viewport: viewport,
    trackers: [tracker],
    sources: [source],
    stats: true,
    gizmos: false,
  });

  const scan = document.getElementById("scan");
  if (scan) scan.style.pointerEvents = "none";

  // @ts-expect-error - event is wrongly typed in the library
  tracker.addEventListener("targetfound", (event: ImageTrackerEvent) => {
    if (scan) scan.hidden = true;
    targetFoundAt = new Date().getTime();
    updateStatus("found", "Target found: " + event.referenceImage.name);
  });

  // @ts-expect-error - event is wrongly typed in the library
  tracker.addEventListener("targetlost", (event: ImageTrackerEvent) => {
    if (scan) scan.hidden = false;
    dot.style.display = "none";
    targetFoundAt = Infinity;
    dot.style.left = window.innerWidth / 2 + "px";
    dot.style.top = window.innerHeight / 2 + "px";

    updateStatus("searching");
  });

  return session;
}

// The animation loop
function animate(time: DOMHighResTimeStamp, frame: Frame) {
  const session = frame.session;
  const deltaTime = session.time.delta; // given in seconds

  mix(frame);

  session.requestAnimationFrame(animate);
}

async function mix(frame: Frame) {
  for (const result of frame.results as Iterable<TrackerResult>) {
    if (result.tracker.type == "image-tracker") {
      if (result.trackables.length > 0) {
        const trackable = result.trackables[0];

        const targetIsStable = targetFoundAt + 50 < new Date().getTime();
        if (!targetIsStable) {
          return;
        }

        const projectionMatrix = (result.viewer as Viewer).view
          .projectionMatrix;
        const viewMatrix = (result.viewer as Viewer).pose.viewMatrix;
        const modelMatrix = (trackable.pose as Pose).transform
          .matrix as SpeedyMatrix;

        const { x, y } = await getObjectCoordinates(
          projectionMatrix,
          viewMatrix,
          modelMatrix
        );

        showDot(x, y);
        return true;
      }
    }
  }

  return false;
}

async function getObjectCoordinates(
  projectionMatrix: SpeedyMatrix,
  viewMatrix: SpeedyMatrix,
  modelMatrix: SpeedyMatrix
) {
  const MV_expr = viewMatrix.times(modelMatrix);
  const MVP_expr = projectionMatrix.times(MV_expr);
  const originVec = Speedy.Matrix(4, 1, [0, 0, 0, 1]);

  // Multiply MVP_expr by that 4×1 vector.
  const clipExpr = MVP_expr.times(originVec);

  const clipMat = Speedy.Matrix(4, 1, [0, 0, 0, 0]);
  await clipMat.setTo(clipExpr);

  const clip4 = clipMat.read();
  const x_clip = clip4[0];
  const y_clip = clip4[1];
  const w_clip = clip4[3];

  // Normalize to NDC (Normalized Device Coordinates):
  const x_ndc = x_clip / w_clip;
  const y_ndc = y_clip / w_clip;

  // Convert NDC to screen coordinates
  const screenX = (x_ndc * 0.5 + 0.5) * window.innerWidth;
  const screenY = (1 - (y_ndc * 0.5 + 0.5)) * window.innerHeight;

  return { x: screenX, y: screenY };
}

/**
 * Start the Demo
 * @returns {void}
 */
function main() {
  startARSession()
    .then((session) => {
      const canvas = session.viewport.canvas; // render your virtual scene on this <canvas>
      console.log(canvas);

      session.requestAnimationFrame(animate); // start the animation loop
    })
    .catch((error) => {
      alert(error.message);
    });
}

document.addEventListener("DOMContentLoaded", main);
