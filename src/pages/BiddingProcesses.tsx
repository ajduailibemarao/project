import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  FileText, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  FileSpreadsheet,
  FilePdf
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Schema for form validation
const biddingProcessSchema = z.object({
  identificacao: z.string().min(1, 'Identificação é obrigatória'),
  modalidade: z.string().min(1, 'Modalidade é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  objeto: z.string().min(1, 'Objeto é obrigatório'),
  dataPublicacao: z.string().min(1, 'Data de publicação é obrigatória'),
  dataAbertura: z.string().min(1, 'Data de abertura é obrigatória'),
  valorEstimado: z.coerce.number().min(0, 'Valor estimado deve ser maior ou igual a zero'),
  valorFinal: z.coerce.number().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
  setor: z.string().min(1, 'Setor é obrigatório'),
  diretoria: z.string().min(1, 'Diretoria é obrigatória'),
  observacoes: z.string().optional(),
});

type BiddingProcessFormData = z.infer<typeof biddingProcessSchema>;

interface BiddingProcess extends BiddingProcessFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const BiddingProcesses: React.FC = () => {
  // State for bidding processes
  const [biddingProcesses, setBiddingProcesses] = useState<BiddingProcess[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<BiddingProcess[]>([]);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState<BiddingProcess | null>(null);
  const [viewingProcess, setViewingProcess] = useState<BiddingProcess | null>(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BiddingProcessFormData>({
    resolver: zodResolver(biddingProcessSchema),
    defaultValues: {
      valorEstimado: 0,
      valorFinal: 0,
    }
  });

  // Mock data for initial load
  useEffect(() => {
    const mockData: BiddingProcess[] = [
      {
        id: '1',
        identificacao: 'PE-2025-001',
        modalidade: 'Pregão Eletrônico',
        tipo: 'Menor Preço',
        objeto: 'Aquisição de equipamentos de informática',
        dataPublicacao: '2025-05-01',
        dataAbertura: '2025-05-15',
        valorEstimado: 250000,
        valorFinal: 230000,
        status: 'Concluído',
        setor: 'TI',
        diretoria: 'Administrativa',
        observacoes: 'Processo concluído com economia de 8%',
        createdAt: '2025-04-20T10:00:00Z',
        updatedAt: '2025-05-20T14:30:00Z'
      },
      {
        id: '2',
        identificacao: 'TP-2025-003',
        modalidade: 'Tomada de Preços',
        tipo: 'Técnica e Preço',
        objeto: 'Contratação de serviços de consultoria',
        dataPublicacao: '2025-04-10',
        dataAbertura: '2025-05-10',
        valorEstimado: 180000,
        valorFinal: undefined,
        status: 'Em Andamento',
        setor: 'Jurídico',
        diretoria: 'Jurídica',
        observacoes: 'Aguardando análise das propostas',
        createdAt: '2025-04-05T09:15:00Z',
        updatedAt: '2025-05-11T11:20:00Z'
      },
      {
        id: '3',
        identificacao: 'CC-2025-002',
        modalidade: 'Concorrência',
        tipo: 'Menor Preço',
        objeto: 'Construção de novo prédio administrativo',
        dataPublicacao: '2025-03-15',
        dataAbertura: '2025-05-05',
        valorEstimado: 1500000,
        valorFinal: undefined,
        status: 'Em Andamento',
        setor: 'Engenharia',
        diretoria: 'Infraestrutura',
        observacoes: 'Fase de habilitação dos participantes',
        createdAt: '2025-03-10T08:30:00Z',
        updatedAt: '2025-05-06T16:45:00Z'
      },
      {
        id: '4',
        identificacao: 'CV-2025-004',
        modalidade: 'Convite',
        tipo: 'Menor Preço',
        objeto: 'Serviços de manutenção predial',
        dataPublicacao: '2025-04-25',
        dataAbertura: '2025-05-05',
        valorEstimado: 75000,
        valorFinal: 72000,
        status: 'Concluído',
        setor: 'Manutenção',
        diretoria: 'Infraestrutura',
        observacoes: 'Processo finalizado com sucesso',
        createdAt: '2025-04-20T13:45:00Z',
        updatedAt: '2025-05-10T10:30:00Z'
      },
      {
        id: '5',
        identificacao: 'PE-2025-005',
        modalidade: 'Pregão Eletrônico',
        tipo: 'Menor Preço',
        objeto: 'Aquisição de material de escritório',
        dataPublicacao: '2025-04-01',
        dataAbertura: '2025-04-15',
        valorEstimado: 50000,
        valorFinal: undefined,
        status: 'Cancelado',
        setor: 'Compras',
        diretoria: 'Administrativa',
        observacoes: 'Cancelado por motivos orçamentários',
        createdAt: '2025-03-25T11:20:00Z',
        updatedAt: '2025-04-20T09:15:00Z'
      },
      {
        id: '6',
        identificacao: 'PE-2025-006',
        modalidade: 'Pregão Eletrônico',
        tipo: 'Menor Preço',
        objeto: 'Contratação de serviços de limpeza',
        dataPublicacao: '2025-05-05',
        dataAbertura: '2025-05-20',
        valorEstimado: 120000,
        valorFinal: undefined,
        status: 'Em Andamento',
        setor: 'Serviços Gerais',
        diretoria: 'Administrativa',
        observacoes: 'Fase de lances',
        createdAt: '2025-04-30T14:10:00Z',
        updatedAt: '2025-05-21T15:30:00Z'
      },
      {
        id: '7',
        identificacao: 'CC-2025-007',
        modalidade: 'Concorrência',
        tipo: 'Melhor Técnica',
        objeto: 'Elaboração de projeto arquitetônico',
        dataPublicacao: '2025-03-01',
        dataAbertura: '2025-04-01',
        valorEstimado: 350000,
        valorFinal: 320000,
        status: 'Concluído',
        setor: 'Projetos',
        diretoria: 'Infraestrutura',
        observacoes: 'Projeto adjudicado à empresa XYZ Arquitetura',
        createdAt: '2025-02-25T10:00:00Z',
        updatedAt: '2025-04-10T16:20:00Z'
      }
    ];
    
    setBiddingProcesses(mockData);
    setFilteredProcesses(mockData);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...biddingProcesses];
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(process => 
        process.identificacao.toLowerCase().includes(searchLower) ||
        process.objeto.toLowerCase().includes(searchLower)
      );
    }
    
    // Modality filter
    if (modalityFilter) {
      result = result.filter(process => process.modalidade === modalityFilter);
    }
    
    // Status filter
    if (statusFilter) {
      result = result.filter(process => process.status === statusFilter);
    }
    
    // Year filter
    if (yearFilter) {
      result = result.filter(process => {
        const year = new Date(process.dataPublicacao).getFullYear().toString();
        return year === yearFilter;
      });
    }
    
    setFilteredProcesses(result);
  }, [biddingProcesses, searchTerm, modalityFilter, statusFilter, yearFilter]);

  // Open modal for new or edit
  const openModal = (process: BiddingProcess | null = null) => {
    if (process) {
      setEditingProcess(process);
      Object.keys(process).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          setValue(key as keyof BiddingProcessFormData, process[key as keyof BiddingProcess]);
        }
      });
    } else {
      setEditingProcess(null);
      reset({
        identificacao: '',
        modalidade: '',
        tipo: '',
        objeto: '',
        dataPublicacao: '',
        dataAbertura: '',
        valorEstimado: 0,
        valorFinal: undefined,
        status: '',
        setor: '',
        diretoria: '',
        observacoes: '',
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingProcess(null);
    reset();
  };

  // Open detail modal
  const openDetailModal = (process: BiddingProcess) => {
    setViewingProcess(process);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setViewingProcess(null);
  };

  // Handle form submission
  const onSubmit = (data: BiddingProcessFormData) => {
    if (editingProcess) {
      // Update existing process
      const updatedProcesses = biddingProcesses.map(process => 
        process.id === editingProcess.id 
          ? { 
              ...process, 
              ...data, 
              updatedAt: new Date().toISOString() 
            } 
          : process
      );
      setBiddingProcesses(updatedProcesses);
      toast.success('Processo de licitação atualizado com sucesso!');
    } else {
      // Create new process
      const newProcess: BiddingProcess = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBiddingProcesses([...biddingProcesses, newProcess]);
      toast.success('Processo de licitação cadastrado com sucesso!');
    }
    closeModal();
  };

  // Delete process
  const deleteProcess = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este processo de licitação?')) {
      const updatedProcesses = biddingProcesses.filter(process => process.id !== id);
      setBiddingProcesses(updatedProcesses);
      toast.success('Processo de licitação excluído com sucesso!');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProcesses.map(process => ({
        'Identificação': process.identificacao,
        'Modalidade': process.modalidade,
        'Tipo': process.tipo,
        'Objeto': process.objeto,
        'Data de Publicação': format(new Date(process.dataPublicacao), 'dd/MM/yyyy'),
        'Data de Abertura': format(new Date(process.dataAbertura), 'dd/MM/yyyy'),
        'Valor Estimado (R$)': process.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Valor Final (R$)': process.valorFinal ? process.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A',
        'Status': process.status,
        'Setor': process.setor,
        'Diretoria': process.diretoria,
        'Observações': process.observacoes || 'N/A'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Licitações');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `licitacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Relatório exportado com sucesso!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Relatório de Processos de Licitação', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    // Add table
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Modalidade', 'Objeto', 'Valor Estimado', 'Status']],
      body: filteredProcesses.map(process => [
        process.identificacao,
        process.modalidade,
        process.objeto.length > 30 ? process.objeto.substring(0, 30) + '...' : process.objeto,
        `R$ ${process.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        process.status
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Save PDF
    doc.save(`licitacoes_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  // Get unique values for filters
  const getUniqueModalities = () => {
    const modalities = new Set(biddingProcesses.map(process => process.modalidade));
    return Array.from(modalities);
  };
  
  const getUniqueStatuses = () => {
    const statuses = new Set(biddingProcesses.map(process => process.status));
    return Array.from(statuses);
  };
  
  const getUniqueYears = () => {
    const years = new Set(biddingProcesses.map(process => 
      new Date(process.dataPublicacao).getFullYear().toString()
    ));
    return Array.from(years);
  };

  // Calculate statistics
  const totalProcesses = filteredProcesses.length;
  const completedProcesses = filteredProcesses.filter(p => p.status === 'Concluído').length;
  const inProgressProcesses = filteredProcesses.filter(p => p.status === 'Em Andamento').length;
  const canceledProcesses = filteredProcesses.filter(p => p.status === 'Cancelado').length;
  
  const totalEstimatedValue = filteredProcesses.reduce((sum, p) => sum + p.valorEstimado, 0);
  const completedProcessesWithFinalValue = filteredProcesses.filter(p => p.status === 'Concluído' && p.valorFinal !== undefined);
  const totalSavings = completedProcessesWithFinalValue.reduce((sum, p) => sum + (p.valorEstimado - (p.valorFinal || 0)), 0);
  const savingsPercentage = totalEstimatedValue > 0 ? (totalSavings / totalEstimatedValue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Processos de Licitação</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Processos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalProcesses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Concluídos / Em Andamento</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{completedProcesses} / {inProgressProcesses}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor Total Estimado</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      R$ {totalEstimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Economia Gerada</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      {savingsPercentage.toFixed(2)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Buscar por identificação ou objeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            
            <div className="relative">
              <button
                onClick={() => document.getElementById('exportMenu')?.classList.toggle('hidden')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              <div id="exportMenu" className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <FileSpreadsheet className="mr-3 h-5 w-5 text-green-500" />
                    Exportar para Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <FilePdf className="mr-3 h-5 w-5 text-red-500" />
                    Exportar para PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="modalityFilter" className="block text-sm font-medium text-gray-700">
                Modalidade
              </label>
              <select
                id="modalityFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {getUniqueModalities().map((modality) => (
                  <option key={modality} value={modality}>
                    {modality}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="statusFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700">
                Ano
              </label>
              <select
                id="yearFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {getUniqueYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Bidding Processes Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificação
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modalidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objeto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Abertura
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcesses.length > 0 ? (
                filteredProcesses.map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {process.identificacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.modalidade}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {process.objeto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(process.dataAbertura), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {process.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${process.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                          process.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {process.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailModal(process)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(process)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteProcess(process.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum processo de licitação encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingProcess ? 'Editar Processo de Licitação' : 'Novo Processo de Licitação'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="identificacao" className="block text-sm font-medium text-gray-700">
                        Identificação
                      </label>
                      <input
                        type="text"
                        id="identificacao"
                        {...register('identificacao')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.identificacao && (
                        <p className="mt-1 text-sm text-red-600">{errors.identificacao.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="modalidade" className="block text-sm font-medium text-gray-700">
                        Modalidade
                      </label>
                      <select
                        id="modalidade"
                        {...register('modalidade')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Pregão Eletrônico">Pregão Eletrônico</option>
                        <option value="Pregão Presencial">Pregão Presencial</option>
                        <option value="Concorrência">Concorrência</option>
                        <option value="Tomada de Preços">Tomada de Preços</option>
                        <option value="Convite">Convite</option>
                        <option value="Leilão">Leilão</option>
                        <option value="Concurso">Concurso</option>
                      </select>
                      {errors.modalidade && (
                        <p className="mt-1 text-sm text-red-600">{errors.modalidade.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                        Tipo
                      </label>
                      <select
                        id="tipo"
                        {...register('tipo')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Menor Preço">Menor Preço</option>
                        <option value="Melhor Técnica">Melhor Técnica</option>
                        <option value="Técnica e Preço">Técnica e Preço</option>
                        <option value="Maior Lance ou Oferta">Maior Lance ou Oferta</option>
                      </select>
                      {errors.tipo && (
                        <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        {...register('status')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Suspenso">Suspenso</option>
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dataPublicacao" className="block text-sm font-medium text-gray-700">
                        Data de Publicação
                      </label>
                      <input
                        type="date"
                        id="dataPublicacao"
                        {...register('dataPublicacao')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.dataPublicacao && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataPublicacao.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dataAbertura" className="block text-sm font-medium text-gray-700">
                        Data de Abertura
                      </label>
                      <input
                        type="date"
                        id="dataAbertura"
                        {...register('dataAbertura')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.dataAbertura && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataAbertura.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="valorEstimado" className="block text-sm font-medium text-gray-700">
                        Valor Estimado (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="valorEstimado"
                        {...register('valorEstimado')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.valorEstimado && (
                        <p className="mt-1 text-sm text-red-600">{errors.valorEstimado.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="valorFinal" className="block text-sm font-medium text-gray-700">
                        Valor Final (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="valorFinal"
                        {...register('valorFinal')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.valorFinal && (
                        <p className="mt-1 text-sm text-red-600">{errors.valorFinal.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="setor" className="block text-sm font-medium text-gray-700">
                        Setor
                      </label>
                      <input
                        type="text"
                        id="setor"
                        {...register('setor')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.setor && (
                        <p className="mt-1 text-sm text-red-600">{errors.setor.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="diretoria" className="block text-sm font-medium text-gray-700">
                        Diretoria
                      </label>
                      <input
                        type="text"
                        id="diretoria"
                        {...register('diretoria')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.diretoria && (
                        <p className="mt-1 text-sm text-red-600">{errors.diretoria.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="objeto" className="block text-sm font-medium text-gray-700">
                        Objeto
                      </label>
                      <textarea
                        id="objeto"
                        rows={3}
                        {...register('objeto')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.objeto && (
                        <p className="mt-1 text-sm text-red-600">{errors.objeto.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
                        Observações
                      </label>
                      <textarea
                        id="observacoes"
                        rows={3}
                        {...register('observacoes')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.observacoes && (
                        <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                 {editingProcess ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && viewingProcess && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detalhes do Processo de Licitação
                  </h3>
                  <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Identificação</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingProcess.identificacao}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Modalidade</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingProcess.modalidade}</div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Tipo</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingProcess.tipo}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Objeto</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingProcess.objeto}</div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Data de Publicação</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingProcess.dataPublicacao), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Data de Abertura</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingProcess.dataAbertura), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Valor Estimado</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      R$ {viewingProcess.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  {viewingProcess.valorFinal !== undefined && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Valor Final</div>
                      <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                        R$ {viewingProcess.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${viewingProcess.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                          viewingProcess.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {viewingProcess.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Setor / Diretoria</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {viewingProcess.setor} / {viewingProcess.diretoria}
                    </div>
                  </div>
                  
                  {viewingProcess.observacoes && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Observações</div>
                      <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingProcess.observacoes}</div>
                    </div>
                  )}
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Data de Cadastro</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingProcess.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Última Atualização</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingProcess.updatedAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeDetailModal();
                      openModal(viewingProcess);
                    }}
                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingProcesses;