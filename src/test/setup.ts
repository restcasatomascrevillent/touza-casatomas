import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver (not available in jsdom)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver (not available in jsdom)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollTo (not available in jsdom)
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Mock requestAnimationFrame (needed by Lenis/Three.js)
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
});
global.cancelAnimationFrame = vi.fn();

// Mock Three.js — WebGL is not available in jsdom
vi.mock("three", () => {
  const mockFn = () => ({});
  return {
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement("canvas"),
      shadowMap: { enabled: false },
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      lookAt: vi.fn(),
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    })),
    Vector2: vi.fn().mockImplementation(() => ({ x: 0, y: 0, set: vi.fn() })),
    Vector3: vi.fn().mockImplementation(() => ({ x: 0, y: 0, z: 0, set: vi.fn(), normalize: vi.fn() })),
    Color: vi.fn().mockImplementation(() => ({ set: vi.fn() })),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
    })),
    MeshStandardMaterial: vi.fn().mockImplementation(mockFn),
    MeshBasicMaterial: vi.fn().mockImplementation(mockFn),
    SphereGeometry: vi.fn().mockImplementation(mockFn),
    BoxGeometry: vi.fn().mockImplementation(mockFn),
    AmbientLight: vi.fn().mockImplementation(mockFn),
    DirectionalLight: vi.fn().mockImplementation(mockFn),
    Clock: vi.fn().mockImplementation(() => ({ getDelta: vi.fn(() => 0.016), getElapsedTime: vi.fn(() => 0) })),
  };
});

// Mock @react-three/fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => children,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {},
    gl: { domElement: document.createElement("canvas") },
    scene: {},
    size: { width: 800, height: 600 },
  })),
  extend: vi.fn(),
}));

// Mock @react-three/drei
vi.mock("@react-three/drei", () => ({
  OrbitControls: vi.fn(() => null),
  Environment: vi.fn(() => null),
  useGLTF: vi.fn(() => ({ scene: {} })),
  Html: vi.fn(({ children }: { children: React.ReactNode }) => children),
  Text: vi.fn(() => null),
  Float: vi.fn(({ children }: { children: React.ReactNode }) => children),
  MeshDistortMaterial: vi.fn(() => null),
  Sparkles: vi.fn(() => null),
}));

// Mock Lenis (smooth scroll — uses DOM APIs not in jsdom)
vi.mock("lenis", () => ({
  default: vi.fn().mockImplementation(() => ({
    raf: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));
