import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';
import '../../data/db/app_db.dart';

class PdfGenerator {
  static Future<pw.Document> generateInvoice(OrderWithItems orderWithItems) async {
    final pdf = pw.Document();
    final order = orderWithItems.order;
    final items = orderWithItems.items;
    
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        'HÓA ĐƠN BÁN HÀNG',
                        style: pw.TextStyle(
                          fontSize: 24,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                      pw.SizedBox(height: 8),
                      pw.Text(
                        'BizFlow - Hệ thống quản lý bán hàng',
                        style: const pw.TextStyle(fontSize: 12),
                      ),
                      pw.Text(
                        'Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                      pw.Text(
                        'Điện thoại: (028) 1234 5678',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Container(
                        padding: const pw.EdgeInsets.all(8),
                        decoration: pw.BoxDecoration(
                          border: pw.Border.all(color: PdfColors.grey300),
                        ),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(
                              'Mã hóa đơn: ${order.code}',
                              style: pw.TextStyle(
                                fontSize: 14,
                                fontWeight: pw.FontWeight.bold,
                              ),
                            ),
                            pw.SizedBox(height: 4),
                            pw.Text(
                              'Ngày: ${_formatDate(order.createdAt)}',
                              style: const pw.TextStyle(fontSize: 10),
                            ),
                            pw.Text(
                              'Giờ: ${_formatTime(order.createdAt)}',
                              style: const pw.TextStyle(fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              pw.SizedBox(height: 24),
              
              // Order Info
              pw.Container(
                padding: const pw.EdgeInsets.all(12),
                decoration: pw.BoxDecoration(
                  color: PdfColors.grey100,
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(4)),
                ),
                child: pw.Row(
                  children: [
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            'Nguồn: ${_getSourceText(order.source)}',
                            style: const pw.TextStyle(fontSize: 12),
                          ),
                          if (order.note?.isNotEmpty == true)
                            pw.Text(
                              'Ghi chú: ${order.note}',
                              style: const pw.TextStyle(fontSize: 12),
                            ),
                        ],
                      ),
                    ),
                    pw.Expanded(
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.end,
                        children: [
                          pw.Text(
                            'Trạng thái: ${_getStatusText(order.status)}',
                            style: pw.TextStyle(
                              fontSize: 12,
                              fontWeight: pw.FontWeight.bold,
                              color: _getStatusColor(order.status),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              pw.SizedBox(height: 16),
              
              // Items Table
              pw.Table(
                border: pw.TableBorder.all(color: PdfColors.grey300),
                columnWidths: {
                  0: const pw.FlexColumnWidth(1), // STT
                  1: const pw.FlexColumnWidth(4), // Tên sản phẩm
                  2: const pw.FlexColumnWidth(2), // Đơn vị
                  3: const pw.FlexColumnWidth(1), // SL
                  4: const pw.FlexColumnWidth(2), // Đơn giá
                  5: const pw.FlexColumnWidth(2), // Thành tiền
                },
                headerRowDecoration: const pw.BoxDecoration(
                  color: PdfColors.grey200,
                ),
                children: [
                  // Header
                  pw.TableRow(
                    children: [
                      _buildTableCell('STT', isHeader: true),
                      _buildTableCell('Sản phẩm', isHeader: true),
                      _buildTableCell('Đơn vị', isHeader: true),
                      _buildTableCell('SL', isHeader: true),
                      _buildTableCell('Đơn giá', isHeader: true),
                      _buildTableCell('Thành tiền', isHeader: true),
                    ],
                  ),
                  // Data rows
                  ...items.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return pw.TableRow(
                      children: [
                        _buildTableCell('${index + 1}'),
                        _buildTableCell('Sản phẩm ${item.productId}'), // Simplified
                        _buildTableCell('Cái'), // Simplified
                        _buildTableCell(item.qty.toStringAsFixed(1)),
                        _buildTableCell(_formatCurrency(item.unitPrice)),
                        _buildTableCell(_formatCurrency(item.lineTotal)),
                      ],
                    );
                  }).toList(),
                ],
              ),
              
              pw.SizedBox(height: 16),
              
              // Summary
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.end,
                children: [
                  pw.Container(
                    width: 200,
                    child: pw.Column(
                      children: [
                        _buildSummaryRow('Tạm tính:', _calculateSubtotal(items)),
                        if (order.discount > 0)
                          _buildSummaryRow('Giảm giá:', order.discount),
                        pw.Divider(color: PdfColors.grey400),
                        _buildSummaryRow(
                          'Tổng cộng:',
                          order.totalAmount,
                          isBold: true,
                        ),
                        _buildSummaryRow('Đã thanh toán:', order.paidAmount),
                        _buildSummaryRow(
                          'Còn nợ:',
                          order.debtAmount,
                          isBold: true,
                          color: order.debtAmount > 0 ? PdfColors.red : PdfColors.green,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              pw.SizedBox(height: 32),
              
              // Footer
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    children: [
                      pw.Text(
                        'Người bán hàng',
                        style: const pw.TextStyle(fontSize: 12),
                      ),
                      pw.SizedBox(height: 32),
                      pw.Container(
                        width: 120,
                        height: 1,
                        color: PdfColors.black,
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        '(Ký và ghi rõ họ tên)',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                  pw.Column(
                    children: [
                      pw.Text(
                        'Người mua hàng',
                        style: const pw.TextStyle(fontSize: 12),
                      ),
                      pw.SizedBox(height: 32),
                      pw.Container(
                        width: 120,
                        height: 1,
                        color: PdfColors.black,
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text(
                        '(Ký và ghi rõ họ tên)',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                ],
              ),
              
              pw.SizedBox(height: 16),
              
              // Footer note
              pw.Center(
                child: pw.Text(
                  'Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ!',
                  style: const pw.TextStyle(fontSize: 10, fontStyle: pw.FontStyle.italic),
                ),
              ),
            ],
          );
        },
      ),
    );
    
    return pdf;
  }

  static pw.Widget _buildTableCell(String text, {bool isHeader = false}) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontSize: isHeader ? 10 : 9,
          fontWeight: isHeader ? pw.FontWeight.bold : pw.FontWeight.normal,
        ),
        textAlign: isHeader ? pw.TextAlign.center : pw.TextAlign.left,
      ),
    );
  }

  static pw.Widget _buildSummaryRow(
    String label,
    double amount, {
    bool isBold = false,
    PdfColor? color,
  }) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(vertical: 2),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
            ),
          ),
          pw.Text(
            _formatCurrency(amount),
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  static String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  static String _formatTime(DateTime date) {
    return DateFormat('HH:mm').format(date);
  }

  static String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  static String _getSourceText(String source) {
    switch (source) {
      case 'counter':
        return 'Bán tại quầy';
      case 'zalo':
        return 'Đơn Zalo';
      case 'phone':
        return 'Đơn điện thoại';
      default:
        return source;
    }
  }

  static String _getStatusText(String status) {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'partial':
        return 'Thanh toán một phần';
      default:
        return 'Không xác định';
    }
  }

  static PdfColor _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return PdfColors.orange;
      case 'paid':
        return PdfColors.green;
      case 'partial':
        return PdfColors.blue;
      default:
        return PdfColors.grey;
    }
  }

  static double _calculateSubtotal(List<OrderItem> items) {
    return items.fold(0.0, (sum, item) => sum + item.lineTotal);
  }
}
