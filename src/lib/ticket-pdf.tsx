import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type TicketPdfData = {
  code: string;
  buyerFullName: string;
  buyerWhatsapp: string;
  eventTitle: string;
  eventLocation: string | null;
  eventModality: string;
  occurrenceStartsAt: Date;
  occurrenceEndsAt: Date | null;
  quantity: number;
  variantLabel: string;
  qrDataUrl: string;
  verifyUrl: string;
  issuedAt: Date;
};

const INK = "#0b0b0b";
const PAPER = "#f7f4ec";
const PAPER_DEEP = "#ece7d8";
const BRAND = "#d2a02b";
const MUTE = "#6e6a5e";

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    padding: 36,
    fontFamily: "Helvetica",
    color: INK,
  },
  outerCard: {
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: PAPER,
    padding: 0,
  },
  topBand: {
    backgroundColor: INK,
    color: BRAND,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandMark: {
    fontSize: 9,
    letterSpacing: 3,
    color: BRAND,
    fontFamily: "Helvetica-Bold",
  },
  brandTitle: {
    fontSize: 11,
    color: PAPER,
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Bold",
  },
  body: {
    flexDirection: "row",
    padding: 26,
    gap: 24,
  },
  leftCol: {
    flex: 1,
    paddingRight: 16,
  },
  rightCol: {
    width: 170,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: INK,
    borderLeftStyle: "dashed",
    paddingLeft: 18,
  },
  eyebrow: {
    fontSize: 7,
    color: MUTE,
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  codeLabel: {
    fontSize: 8,
    color: MUTE,
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
  },
  code: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginTop: 2,
    marginBottom: 14,
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 10,
    lineHeight: 1.2,
  },
  sectionRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 10,
  },
  field: {
    marginBottom: 10,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    color: MUTE,
    letterSpacing: 1.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 11,
    color: INK,
    fontFamily: "Helvetica",
  },
  qrImage: {
    width: 140,
    height: 140,
    marginVertical: 8,
  },
  qrCaption: {
    fontSize: 7,
    color: MUTE,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 1,
  },
  qrUrl: {
    fontSize: 6,
    color: MUTE,
    textAlign: "center",
    marginTop: 2,
  },
  ticketCount: {
    backgroundColor: BRAND,
    color: INK,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  bottomStrip: {
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: INK,
    borderTopStyle: "dashed",
    padding: 16,
    backgroundColor: PAPER_DEEP,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripLabel: {
    fontSize: 7,
    color: MUTE,
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
  },
  stripValue: {
    fontSize: 9,
    color: INK,
    fontFamily: "Helvetica-Bold",
  },
  notes: {
    marginTop: 24,
    fontSize: 8,
    color: MUTE,
    lineHeight: 1.5,
  },
  notesTitle: {
    fontSize: 8,
    color: INK,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: MUTE,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: MUTE,
  },
  goldRule: {
    height: 3,
    backgroundColor: BRAND,
    marginVertical: 4,
  },
});

const dateFmt = new Intl.DateTimeFormat("es-VE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("es-VE", {
  hour: "2-digit",
  minute: "2-digit",
});
const stampFmt = new Intl.DateTimeFormat("es-VE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateLong(d: Date): string {
  return dateFmt.format(d);
}
function formatTime(d: Date): string {
  return timeFmt.format(d);
}

const MODALITY_LABEL: Record<string, string> = {
  IN_PERSON: "Presencial",
  ONLINE: "En línea",
  HYBRID: "Híbrido",
};

export function TicketPdf({ data }: { data: TicketPdfData }) {
  const dateLine = formatDateLong(data.occurrenceStartsAt);
  const timeLine = data.occurrenceEndsAt
    ? `${formatTime(data.occurrenceStartsAt)} – ${formatTime(data.occurrenceEndsAt)}`
    : formatTime(data.occurrenceStartsAt);
  const modalityLabel = MODALITY_LABEL[data.eventModality] ?? data.eventModality;

  return (
    <Document
      title={`Boleto ${data.code}`}
      author="Curso Nacional"
      subject={data.eventTitle}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.outerCard}>
          <View style={styles.topBand}>
            <Text style={styles.brandMark}>CURSO NACIONAL</Text>
            <Text style={styles.brandTitle}>BOLETO DE ACCESO</Text>
          </View>
          <View style={styles.goldRule} />

          <View style={styles.body}>
            <View style={styles.leftCol}>
              <Text style={styles.codeLabel}>CÓDIGO DE INSCRIPCIÓN</Text>
              <Text style={styles.code}>{data.code}</Text>

              <Text style={styles.eyebrow}>EVENTO</Text>
              <Text style={styles.eventTitle}>{data.eventTitle}</Text>

              <View style={styles.sectionRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>FECHA</Text>
                  <Text style={styles.fieldValue}>{dateLine}</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>HORARIO</Text>
                  <Text style={styles.fieldValue}>{timeLine}</Text>
                </View>
              </View>

              <View style={styles.sectionRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>LUGAR</Text>
                  <Text style={styles.fieldValue}>
                    {data.eventLocation ?? "Por confirmar"}
                  </Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>MODALIDAD</Text>
                  <Text style={styles.fieldValue}>{modalityLabel}</Text>
                </View>
              </View>

              <View style={styles.sectionRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>ASISTENTE</Text>
                  <Text style={styles.fieldValue}>{data.buyerFullName}</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>TARIFA</Text>
                  <Text style={styles.fieldValue}>{data.variantLabel}</Text>
                </View>
              </View>

              <Text style={styles.ticketCount}>
                ADMITE {data.quantity} {data.quantity === 1 ? "PERSONA" : "PERSONAS"}
              </Text>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.eyebrow}>VERIFICAR</Text>
              {data.qrDataUrl && <Image src={data.qrDataUrl} style={styles.qrImage} />}
              <Text style={styles.qrCaption}>ESCANEA PARA VALIDAR</Text>
              <Text style={styles.qrUrl}>{data.verifyUrl}</Text>
            </View>
          </View>

          <View style={styles.bottomStrip}>
            <View>
              <Text style={styles.stripLabel}>CÓDIGO</Text>
              <Text style={styles.stripValue}>{data.code}</Text>
            </View>
            <View>
              <Text style={styles.stripLabel}>EMITIDO</Text>
              <Text style={styles.stripValue}>{stampFmt.format(data.issuedAt)}</Text>
            </View>
            <View>
              <Text style={styles.stripLabel}>CUPOS</Text>
              <Text style={styles.stripValue}>{data.quantity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={styles.notesTitle}>INDICACIONES</Text>
          <Text>
            · Presenta este boleto impreso o desde tu dispositivo en la entrada.
          </Text>
          <Text>
            · El código QR registra cada ingreso; conserva tu boleto si tu grupo
            entra por separado.
          </Text>
          <Text>
            · Una vez utilizado el cupo completo, el boleto queda invalidado.
          </Text>
          <Text>
            · Ante cualquier eventualidad, escribe por WhatsApp con tu código de
            inscripción.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            cursonacional.ve · Mi futuro es hoy.
          </Text>
          <Text style={styles.footerText}>{data.code}</Text>
        </View>
      </Page>
    </Document>
  );
}
