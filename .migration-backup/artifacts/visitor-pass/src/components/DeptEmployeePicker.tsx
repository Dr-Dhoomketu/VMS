import { useState, useEffect, useRef } from 'react';
import { API_URL } from '@/lib/api';

interface Dept { _id: string; name: string; }
interface Employee { _id: string; name: string; }

interface Props {
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
  initialName?: string;
}

export default function DeptEmployeePicker({ value, onChange, required, initialName }: Props) {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDept, setSelectedDept] = useState<Dept | null>(null);
  const [search, setSearch] = useState('');
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedName, setSelectedName] = useState(initialName || '');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/departments`)
      .then(r => r.json()).then(d => setDepartments(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDept) { setEmployees([]); return; }
    setLoadingEmps(true);
    fetch(`${API_URL}/api/v1/users/employees?department=${selectedDept._id}`)
      .then(r => r.json())
      .then(d => { setEmployees(d || []); setLoadingEmps(false); setTimeout(() => searchRef.current?.focus(), 80); })
      .catch(() => setLoadingEmps(false));
  }, [selectedDept]);

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedName(emp.name);
    onChange(emp._id);
    setSelecting(false);
    setSelectedDept(null);
    setSearch('');
  };

  const handleNotAllocated = () => {
    setSelectedName('Not Allocated / Walk to Reception');
    onChange('unallocated');
    setSelecting(false);
    setSelectedDept(null);
    setSearch('');
  };

  const handleChange = () => {
    setSelecting(true);
    setSelectedDept(null);
    setSearch('');
  };

  const isSelected = !!value;

  if (isSelected && !selecting) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', border: '1.5px solid #2F5DAA',
        borderRadius: '10px', background: 'rgba(47,93,170,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: value === 'unallocated' ? 'rgba(100,116,139,0.12)' : 'rgba(47,93,170,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {value === 'unallocated'
              ? <svg style={{ width: '14px', height: '14px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              : <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2F5DAA' }}>{selectedName.charAt(0)}</span>
            }
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A1F44' }}>{selectedName}</div>
            {value !== 'unallocated' && selectedDept && (
              <div style={{ fontSize: '0.6rem', color: '#6B7FA3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedDept.name}</div>
            )}
          </div>
        </div>
        <button type="button" onClick={handleChange} style={{
          fontSize: '0.65rem', fontWeight: 700, color: '#2F5DAA',
          background: 'none', border: '1px solid rgba(47,93,170,0.3)',
          borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
        }}>Change</button>
        {required && <input type="hidden" name="meetWith" value={value} required />}
      </div>
    );
  }

  return (
    <div>
      {/* Department selection */}
      {!selectedDept && (
        <div>
          <div style={{
            fontSize: '0.6rem', fontWeight: 700, color: '#6B7FA3',
            textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px',
          }}>Select Department</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
            {departments.map(dept => (
              <button
                key={dept._id}
                type="button"
                onClick={() => setSelectedDept(dept)}
                style={{
                  padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #E2E8F0', background: '#fff',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2F5DAA'; el.style.background = 'rgba(47,93,170,0.04)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E2E8F0'; el.style.background = '#fff'; }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A1F44', marginBottom: '2px' }}>{dept.name}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={handleNotAllocated}
              style={{
                padding: '10px 12px', borderRadius: '10px',
                border: '1.5px dashed #CBD5E1', background: '#F8FAFC',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#94A3B8'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#CBD5E1'; }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Not Allocated</div>
              <div style={{ fontSize: '0.58rem', color: '#94A3B8', marginTop: '2px' }}>Walk to reception</div>
            </button>
          </div>
        </div>
      )}

      {/* Employee list within department */}
      {selectedDept && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <button type="button" onClick={() => { setSelectedDept(null); setSearch(''); }} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.65rem', fontWeight: 700, color: '#6B7FA3',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              Departments
            </button>
            <span style={{ fontSize: '0.6rem', color: '#CBD5E1' }}>›</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0A1F44' }}>{selectedDept.name}</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #E2E8F0',
                borderRadius: '10px', fontSize: '0.82rem', color: '#0A1F44',
                outline: 'none', boxSizing: 'border-box', background: '#fff',
              }}
              onFocus={e => { e.target.style.borderColor = '#2F5DAA'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#fff' }}>
            {loadingEmps && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#A0AEC0', fontSize: '0.75rem' }}>Loading…</div>
            )}
            {!loadingEmps && filtered.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#A0AEC0', fontSize: '0.75rem' }}>
                {employees.length === 0 ? 'No employees in this department' : 'No match found'}
              </div>
            )}
            {!loadingEmps && filtered.map((emp, idx) => (
              <button
                key={emp._id}
                type="button"
                onClick={() => handleSelectEmployee(emp)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(47,93,170,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: '#2F5DAA',
                }}>
                  {emp.name.charAt(0)}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0A1F44' }}>{emp.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleNotAllocated}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', border: 'none', borderTop: '1px dashed #E2E8F0',
                background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(100,116,139,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg style={{ width: '14px', height: '14px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Not Allocated</div>
                <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>Walk to reception</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
