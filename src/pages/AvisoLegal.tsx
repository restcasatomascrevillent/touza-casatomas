import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout, { Pendiente } from "@/components/legal/LegalLayout";
import { canonical } from "@/lib/site";
import { DOMINIO, ESTABLECIMIENTO, RUTAS_LEGALES, TITULAR } from "@/lib/legal";

// Texto propio, escrito para esta web (no copiado del WordPress antiguo): de
// allí solo se toman los datos identificativos. Ver src/lib/legal.ts.
const AvisoLegal = () => (
  <>
    <Seo
      title="Aviso legal"
      description="Datos identificativos del titular de la web de Touza Cocktail Bar (Crevillente) y condiciones de uso, conforme a la LSSI-CE."
      canonical={canonical(RUTAS_LEGALES.avisoLegal)}
      keywords={[]}
    />
    <LegalLayout
      titulo="Aviso legal"
      entradilla="Quién está detrás de esta web y en qué condiciones puedes usarla, tal y como exige la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)."
    >
      <h2 id="titular">1. Titular de la web</h2>
      <dl>
        <dt>Denominación social</dt>
        <dd>{TITULAR.denominacion}</dd>
        <dt>CIF</dt>
        <dd>{TITULAR.cif}</dd>
        <dt>Domicilio social</dt>
        <dd>{TITULAR.domicilio}</dd>
        <dt>Datos registrales</dt>
        <dd>
          <Pendiente>{TITULAR.registroMercantil}</Pendiente>
        </dd>
        <dt>Nombre comercial del establecimiento</dt>
        <dd>
          {ESTABLECIMIENTO.nombreComercial} · {ESTABLECIMIENTO.direccion}
        </dd>
        <dt>Contacto</dt>
        <dd>
          <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a> ·{" "}
          <a href={TITULAR.telefonoHref} className="whitespace-nowrap">{TITULAR.telefono}</a>
        </dd>
        <dt>Sitio web</dt>
        <dd>{DOMINIO}</dd>
      </dl>
      <p>
        Touza Cocktail Bar forma parte del grupo de Restaurante Casa Tomás. En adelante, «el titular» o «nosotros».
      </p>

      <h2 id="objeto">2. Objeto y aceptación</h2>
      <p>
        Esta web da a conocer Touza Cocktail Bar: su carta, su galería, su horario y los datos de contacto. No tiene
        formularios ni permite hacer compras: para cualquier consulta, llámanos o escríbenos.
      </p>
      <p>
        Navegar por la web te convierte en usuario e implica que aceptas este aviso legal. Si no estás de acuerdo con él,
        te pedimos que no la uses. Podemos actualizar estos textos cuando cambie la web o la normativa; la versión
        vigente es siempre la publicada aquí, con su fecha al principio.
      </p>

      <h2 id="uso">3. Uso de la web</h2>
      <p>Te comprometes a usar la web de forma lícita y, en particular, a no:</p>
      <ul>
        <li>introducir virus o cualquier código que pueda dañar la web o los equipos de otros usuarios;</li>
        <li>intentar acceder a zonas restringidas o a los sistemas que hay detrás de la web;</li>
        <li>hacer un uso automatizado o masivo de la web que pueda dañarla o sobrecargarla.</li>
      </ul>
      <p>
        Los precios y la carta que se muestran son orientativos y pueden cambiar sin previo aviso; los que valen son
        los del local. La venta de bebidas alcohólicas a menores de 18 años está prohibida.
      </p>

      <h2 id="propiedad">4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, fotografías, logotipos, marcas, diseño y código de esta web son del titular o de terceros que le han
        autorizado su uso, y están protegidos por la legislación de propiedad intelectual e industrial. No se pueden
        reproducir, distribuir, transformar ni comunicar públicamente, en todo o en parte, sin autorización previa y
        por escrito, salvo para uso privado o en los casos que permita la ley.
      </p>
      <p>
        Puedes enlazar a cualquier página de esta web siempre que el enlace no dé a entender una relación que no
        existe ni se use para fines ilícitos.
      </p>

      <h2 id="responsabilidad">5. Responsabilidad</h2>
      <p>
        Cuidamos que la información de la web sea correcta y esté al día, pero puede contener errores u omisiones y la
        web puede no estar disponible en algún momento por mantenimiento o por causas ajenas a nosotros. No
        respondemos de los daños que puedan derivarse de esas interrupciones ni del mal uso de la web por parte de los
        usuarios.
      </p>
      <p>
        La web enlaza con sitios de terceros (Instagram, Facebook, Google Maps y otros). No controlamos su contenido
        ni respondemos de él; si detectas un enlace a un contenido ilícito, avísanos y lo retiraremos en cuanto
        tengamos conocimiento efectivo, como prevén los artículos 16 y 17 de la LSSI-CE.
      </p>

      <h2 id="datos">6. Protección de datos y cookies</h2>
      <p>
        Cómo tratamos los datos que nos facilitas está explicado en la{" "}
        <Link to={RUTAS_LEGALES.privacidad}>política de privacidad</Link>, y qué guarda la web en tu navegador, en
        la <Link to={RUTAS_LEGALES.cookies}>política de cookies</Link>.
      </p>

      <h2 id="ley">7. Ley aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia, y salvo que la normativa de
        consumidores disponga otra cosa, serán competentes los juzgados y tribunales del domicilio del usuario.
      </p>
    </LegalLayout>
  </>
);

export default AvisoLegal;
