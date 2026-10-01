import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout, { TablaLegal } from "@/components/legal/LegalLayout";
import { canonical } from "@/lib/site";
import { ESTABLECIMIENTO, RUTAS_LEGALES, TITULAR } from "@/lib/legal";

// Describe lo que la web hace HOY (revisado en el código el 01/10/2026):
//  · Sin formularios: Touza no acepta reservas por la web (decisión del
//    dueño, 01/10/2026). Se retiró el de El Reservado y, con él, lo que solo
//    existía por él: solicitudes en Supabase, comprobación de la lista de
//    exclusión, consentimiento para alergias y correos por Resend.
//  · El contacto es por teléfono o correo (datos en src/lib/legal.ts).
//  · Supabase (proyecto en eu-west-1, Irlanda): el navegador lee de ahí la
//    carta, sin iniciar sesión y sin enviar datos del visitante.
//  · Vercel aloja la web y sirve Vercel Web Analytics (sin cookies).
//  · Google Maps en /contacto: solo con consentimiento o a petición.
//  · Google Fonts se cargan desde los servidores de Google (index.html).
//  · 5 fotos de la galería se sirven desde Unsplash.
// Si cambia cualquiera de estas piezas, hay que cambiar este texto.

const enlaceExterno = (href: string, texto: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {texto}
  </a>
);

const Privacidad = () => (
  <>
    <Seo
      title="Política de privacidad"
      description="Cómo trata Touza Cocktail Bar los datos personales de quien le llama o le escribe y de la navegación por la web, conforme al RGPD y la LOPDGDD."
      canonical={canonical(RUTAS_LEGALES.privacidad)}
      keywords={[]}
    />
    <LegalLayout
      titulo="Política de privacidad"
      entradilla="Qué datos personales recoge esta web, para qué los usamos, con quién los compartimos, cuánto tiempo los guardamos y cómo puedes ejercer tus derechos, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD)."
    >
      <h2 id="responsable">1. Responsable del tratamiento</h2>
      <dl>
        <dt>Responsable</dt>
        <dd>
          {TITULAR.denominacion} · CIF {TITULAR.cif}
        </dd>
        <dt>Domicilio</dt>
        <dd>{TITULAR.domicilio}</dd>
        <dt>Establecimiento</dt>
        <dd>
          {ESTABLECIMIENTO.nombreComercial} · {ESTABLECIMIENTO.direccion}
        </dd>
        <dt>Contacto para temas de privacidad</dt>
        <dd>
          <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a> ·{" "}
          <a href={TITULAR.telefonoHref} className="whitespace-nowrap">{TITULAR.telefono}</a>
        </dd>
      </dl>

      <h2 id="datos">2. Qué datos tratamos</h2>
      <p>
        Esta web no tiene formularios: no recoge nada de lo que escribas en ella.
      </p>
      <h3>Si nos llamas o nos escribes</h3>
      <ul>
        <li>
          Los datos que tú nos des: tu nombre, tu teléfono o tu correo electrónico y lo que nos cuentes en la
          llamada o en el mensaje.
        </li>
      </ul>
      <p>Por favor, no nos envíes datos de salud ni otros datos sensibles por correo.</p>
      <h3>Si solo navegas</h3>
      <ul>
        <li>
          Datos técnicos de la visita que recoge el alojamiento (dirección IP, navegador, página pedida y hora), en los
          registros del servidor.
        </li>
        <li>
          Estadísticas de visitas sin cookies (Vercel Web Analytics): página vista, página de procedencia, país,
          tipo de dispositivo, navegador y sistema operativo. No guarda tu IP ni te identifica, y no te sigue entre
          webs.
        </li>
        <li>
          Lo que Google recoja si cargas el mapa de la página de contacto (ver el punto 5 y la{" "}
          <Link to={RUTAS_LEGALES.cookies}>política de cookies</Link>).
        </li>
      </ul>

      <h2 id="finalidades">3. Para qué los usamos y con qué base legal</h2>
      <TablaLegal
        titulo="Finalidades y bases legales"
        cabeceras={["Finalidad", "Base legal (RGPD)"]}
        filas={[
          [
            "Contestar a lo que nos preguntes o nos pidas por teléfono o por correo.",
            "Tu propia petición: medidas precontractuales a petición tuya (art. 6.1.b) o, si no tiene que ver con un servicio, nuestro interés legítimo en atenderte (art. 6.1.f).",
          ],
          [
            "Medir las visitas a la web de forma agregada y sin cookies, para saber qué páginas funcionan.",
            "Interés legítimo en mejorar la web (art. 6.1.f).",
          ],
          [
            "Mantener la web segura y funcionando (registros técnicos del servidor).",
            "Interés legítimo (art. 6.1.f).",
          ],
          [
            "Mostrarte el mapa interactivo de Google en la página de contacto.",
            "Tu consentimiento (art. 6.1.a), que se pide en el aviso de cookies o al pulsar «Cargar mapa».",
          ],
          [
            "Cumplir obligaciones legales y atender requerimientos de autoridades.",
            "Obligación legal (art. 6.1.c).",
          ],
        ]}
      />
      <p>
        No usamos tus datos para enviarte publicidad, no tomamos decisiones automatizadas que te afecten de forma
        significativa ni elaboramos perfiles.
      </p>

      <h2 id="conservacion">4. Cuánto tiempo los conservamos</h2>
      <ul>
        <li>
          <strong>Consultas por teléfono o correo:</strong> el tiempo necesario para contestarte. Después, los datos
          se conservan bloqueados solo durante los plazos de prescripción de las acciones legales que puedan
          derivarse, y luego se suprimen.
        </li>
        <li>
          <strong>Estadísticas de visitas:</strong> se guardan agregadas, sin datos que te identifiquen.
        </li>
      </ul>

      <h2 id="destinatarios">5. Con quién los compartimos</h2>
      <p>
        No vendemos ni cedemos tus datos. Solo los comunicamos a autoridades cuando una ley nos obliga. Para que la web
        funcione, algunos proveedores acceden a ellos por cuenta nuestra (encargados del tratamiento), con contrato y
        solo para prestarnos su servicio:
      </p>
      <TablaLegal
        titulo="Proveedores"
        cabeceras={["Proveedor", "Para qué", "Dónde"]}
        filas={[
          [
            "Supabase, Inc.",
            "Base de datos de la que se carga la carta. Recibe los datos técnicos de la conexión (como la IP), pero la web no le envía datos tuyos.",
            "Servidores en la Unión Europea (Irlanda).",
          ],
          [
            "Vercel, Inc.",
            "Alojamiento de la web y estadísticas de visitas sin cookies.",
            "Red global; empresa con sede en EE. UU.",
          ],
        ]}
      />
      <p>
        Además, algunos recursos de la web los sirven terceros, que reciben tu dirección IP al cargarlos y la tratan
        como responsables independientes:
      </p>
      <ul>
        <li>
          <strong>Google Ireland Ltd.</strong>: el mapa de la página de contacto, solo si lo aceptas (con cookies; ver{" "}
          {enlaceExterno("https://policies.google.com/privacy?hl=es", "su política de privacidad")}), y las tipografías
          de la web (Google Fonts, sin cookies).
        </li>
        <li>
          <strong>Unsplash</strong>: algunas fotografías de la galería.
        </li>
        <li>
          <strong>Instagram y Facebook (Meta)</strong>: solo si sigues los enlaces a nuestros perfiles; a partir de ahí
          se aplican sus propias políticas.
        </li>
      </ul>

      <h2 id="transferencias">6. Transferencias internacionales</h2>
      <p>
        Vercel es una empresa de EE. UU. y puede acceder a datos desde allí. Esas transferencias se amparan en el Marco
        de Privacidad de Datos UE-EE. UU. o, en su defecto, en las cláusulas contractuales tipo aprobadas por la
        Comisión Europea (art. 46 RGPD). La base de datos de la carta (Supabase) está en la Unión Europea.
      </p>

      <h2 id="derechos">7. Tus derechos</h2>
      <p>Puedes pedirnos en cualquier momento, gratis:</p>
      <ul>
        <li>
          <strong>Acceso</strong>: saber si tratamos datos tuyos y cuáles.
        </li>
        <li>
          <strong>Rectificación</strong> de los que sean inexactos y <strong>supresión</strong> de los que ya no sean
          necesarios.
        </li>
        <li>
          <strong>Oposición</strong> a los tratamientos basados en interés legítimo y <strong>limitación</strong> del
          tratamiento en los casos previstos por la ley.
        </li>
        <li>
          <strong>Portabilidad</strong>: recibir los datos que nos diste en un formato estructurado.
        </li>
        <li>
          <strong>Retirar tu consentimiento</strong> cuando el tratamiento se base en él, sin que afecte a lo hecho
          antes. Para el mapa de Google, desde la <Link to={RUTAS_LEGALES.cookies}>política de cookies</Link>.
        </li>
      </ul>
      <p>
        Escríbenos a <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a> o por correo postal a{" "}
        {TITULAR.domicilio}, indicando qué derecho quieres ejercer. Si no podemos comprobar quién eres por otros
        medios, te pediremos un documento que acredite tu identidad. Te responderemos en el plazo de un mes.
      </p>
      <p>
        Si crees que no hemos atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de
        Datos ({enlaceExterno("https://www.aepd.es", "www.aepd.es")}), C/ Jorge Juan, 6, 28001 Madrid.
      </p>

      <h2 id="menores">8. Menores de edad</h2>
      <p>
        Touza es una coctelería y esta web no está dirigida a menores. No recogemos a sabiendas datos de menores de 14
        años (art. 7 LOPDGDD).
      </p>

      <h2 id="seguridad">9. Seguridad y veracidad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas para proteger tus datos: conexión cifrada (HTTPS), acceso
        restringido al personal autorizado y proveedores con garantías. Si nos das datos de otra persona, debes tener
        su permiso.
      </p>

      <h2 id="cambios">10. Cambios en esta política</h2>
      <p>
        Si cambia lo que hacemos con los datos, actualizaremos este texto y su fecha de última actualización.
      </p>
    </LegalLayout>
  </>
);

export default Privacidad;
