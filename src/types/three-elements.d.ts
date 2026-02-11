
import { Object3DNode } from "@react-three/fiber";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
            icosahedronGeometry: Object3DNode<THREE.IcosahedronGeometry, typeof THREE.IcosahedronGeometry>;
            ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
            directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
        }
    }
}
