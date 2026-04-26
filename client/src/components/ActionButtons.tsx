import { Send, RefreshCcw, Download } from 'lucide-react';

interface Props {
  onApply: () => void;
  onRecalculate: () => void;
  onDownload: () => void;
}

export default function ActionButtons({ onApply, onRecalculate, onDownload }: Props) {
  return (
    <div className="animate-fade-in-up delay-6" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button id="apply-btn" onClick={onApply} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minWidth: 150 }}>
        <Send size={16} /> Apply for Loan
      </button>
      <button id="recalculate-btn" onClick={onRecalculate} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minWidth: 150 }}>
        <RefreshCcw size={16} /> Recalculate
      </button>
      <button id="download-btn" onClick={onDownload} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minWidth: 150 }}>
        <Download size={16} /> Download Report
      </button>
    </div>
  );
}
 