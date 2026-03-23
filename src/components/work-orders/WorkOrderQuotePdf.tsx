'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { WorkOrderQuoteData } from '@/data/workOrderQuote';

// Register Helvetica as the base font (built-in PDF font, no external files needed)
Font.registerHyphenationCallback((word) => [word]);

const COMPANY_NAME = 'MECHANIC TECH SOLUTIONS - MTS';
const COMPANY_ADDRESS = 'Av. Lo Espejo 01565, Logístico Mersán - Bodega 1424 Pasillo 12';
const COMPANY_PHONE = '+569 99999999';
const COMPANY_EMAIL = 'jose.perez@mtsgarage.cl';
const IVA_RATE = 0.19;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    color: '#1a1a1a',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a5c',
  },
  headerQuoteNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a5c',
    marginBottom: 8,
  },
  // Info section
  infoSection: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#555',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 9,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#1a3a5c',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a5c',
    paddingBottom: 2,
    marginBottom: 4,
    marginTop: 6,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a3a5c',
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableRowEven: {
    backgroundColor: '#f7f9fc',
  },
  colPlate: { width: '10%' },
  colService: { width: '30%' },
  colSparePart: { width: '22%' },
  colHour: { width: '10%', textAlign: 'right' },
  colSparePartCost: { width: '14%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  // Totals
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  totalsLabel: {
    width: 110,
    textAlign: 'right',
    fontSize: 8,
    color: '#555',
    paddingRight: 8,
  },
  totalsValue: {
    width: 70,
    textAlign: 'right',
    fontSize: 8,
  },
  totalsFinalLabel: {
    width: 110,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingRight: 8,
  },
  totalsFinalValue: {
    width: 70,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#1a3a5c',
  },
  // Footer
  footer: {
    marginTop: 20,
    fontSize: 7,
    color: '#888',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 6,
  },
});

function fmt(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCLP(value: number): string {
  return value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

interface WorkOrderQuotePdfProps {
  quoteData: WorkOrderQuoteData;
  sellerName: string;
}

export function WorkOrderQuotePdf({ quoteData, sellerName }: WorkOrderQuotePdfProps) {
  // Build table rows — one row per service, spare parts listed inline
  type TableRow = {
    plate: string;
    serviceName: string;
    sparePart: string;
    hourlyRate: string | null;
    sparePartCost: string | null;
    totalNeto: number;
  };

  const rows: TableRow[] = [];

  for (const svc of quoteData.services) {
    // Spare parts belonging to this service
    const parts = quoteData.spareParts.filter(
      (sp) => sp.workOrderServiceId === svc.workOrderServiceId,
    );

    const hourlyRate = parseFloat(svc.actualHourlyRate ?? svc.estimatedHourlyRate ?? '0') || 0;
    const discount = parseFloat(svc.discount ?? '0') || 0;

    if (parts.length === 0) {
      const totalNeto = Math.max(0, hourlyRate - discount);
      rows.push({
        plate: quoteData.vehiclePlate,
        serviceName: svc.serviceName,
        sparePart: '—',
        hourlyRate: svc.actualHourlyRate ?? svc.estimatedHourlyRate,
        sparePartCost: null,
        totalNeto,
      });
    } else {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partCost = parseFloat(part.cost) || 0;
        const svcShare = i === 0 ? hourlyRate : 0;
        const discShare = i === 0 ? discount : 0;
        const totalNeto = Math.max(0, svcShare + partCost - discShare);
        rows.push({
          plate: i === 0 ? quoteData.vehiclePlate : '',
          serviceName: i === 0 ? svc.serviceName : '',
          sparePart: part.description,
          hourlyRate: i === 0 ? (svc.actualHourlyRate ?? svc.estimatedHourlyRate) : null,
          sparePartCost: part.cost,
          totalNeto,
        });
      }
    }
  }

  // Subtotal = sum of totalNeto
  const subtotal = rows.reduce((acc, r) => acc + r.totalNeto, 0);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{COMPANY_NAME}</Text>
          <View>
            <Text style={styles.headerQuoteNumber}>COTIZACIÓN N° {quoteData.workOrderCode}</Text>
            <Text style={{ fontSize: 8, textAlign: 'right', color: '#555' }}>
              Fecha: {formatDate(quoteData.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Seller / Client info */}
        <View style={styles.infoSection}>
          {/* Seller */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Vendedor</Text>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{sellerName}</Text>
            <Text style={styles.infoLabel}>Empresa</Text>
            <Text style={styles.infoValue}>{COMPANY_NAME}</Text>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{COMPANY_ADDRESS}</Text>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{COMPANY_PHONE}</Text>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{COMPANY_EMAIL}</Text>
          </View>

          {/* Client */}
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.infoLabel}>RUT / Código</Text>
            <Text style={styles.infoValue}>{quoteData.client.id}</Text>
            <Text style={styles.infoLabel}>Nombre</Text>
            <Text style={styles.infoValue}>{quoteData.client.name}</Text>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{quoteData.client.phone ?? '—'}</Text>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{quoteData.client.email ?? '—'}</Text>
            <Text style={styles.infoLabel}>Patente</Text>
            <Text style={styles.infoValue}>{quoteData.vehiclePlate}</Text>
          </View>
        </View>

        {/* Table */}
        <Text style={styles.sectionTitle}>Detalle de Servicios y Repuestos</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colPlate}>PATENTE</Text>
          <Text style={styles.colService}>DESC. MANO DE OBRA</Text>
          <Text style={styles.colSparePart}>REPUESTO</Text>
          <Text style={styles.colHour}>$/HORA</Text>
          <Text style={styles.colSparePartCost}>$/REPUESTO</Text>
          <Text style={styles.colTotal}>P.TOTAL NETO</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowEven : {}]}>
            <Text style={styles.colPlate}>{row.plate}</Text>
            <Text style={styles.colService}>{row.serviceName}</Text>
            <Text style={styles.colSparePart}>{row.sparePart}</Text>
            <Text style={styles.colHour}>{row.hourlyRate ? fmt(row.hourlyRate) : ''}</Text>
            <Text style={styles.colSparePartCost}>{row.sparePartCost ? fmt(row.sparePartCost) : ''}</Text>
            <Text style={styles.colTotal}>{fmtCLP(row.totalNeto)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmtCLP(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>IVA (19%)</Text>
            <Text style={styles.totalsValue}>{fmtCLP(iva)}</Text>
          </View>
          <View style={[styles.totalsRow, { borderTopWidth: 1, borderTopColor: '#1a3a5c', paddingTop: 3 }]}>
            <Text style={styles.totalsFinalLabel}>TOTAL MONTO A PAGAR</Text>
            <Text style={styles.totalsFinalValue}>{fmtCLP(total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Esta cotización tiene una validez de 15 días hábiles desde su fecha de emisión.
            Los precios indicados no incluyen IVA salvo indicación expresa.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
