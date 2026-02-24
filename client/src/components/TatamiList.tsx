import React, { type FC } from "react";
import { observer } from "mobx-react-lite";
import type { ITatami } from "../models/ITatami";

interface Props {
    tatamis: ITatami[];
    onStatusChange?: (tatamiId: string, isActive: boolean) => void;
    canEdit?: boolean;
}

const TatamiList: FC<Props> = ({ tatamis, onStatusChange, canEdit = false }) => {
    
    if (tatamis.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Татами еще не созданы
            </div>
        )
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>📋 Список татами</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
                {tatamis.map(tatami => (
                    <div 
                        key={tatami._id}
                        style={{ 
                            padding: '15px', 
                            backgroundColor: tatami.isActive ? '#e8f5e9' : '#ffebee',
                            borderRadius: '8px',
                            border: `2px solid ${tatami.isActive ? '#4caf50' : '#f44336'}`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>
                                    🥋 Татами №{tatami.number} - {tatami.name}
                                </h4>
                                <p style={{ margin: '5px 0', color: '#666' }}>
                                    <strong>Админ:</strong> {tatami.admin.email}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Статус:</strong>{' '}
                                    <span style={{ 
                                        color: tatami.isActive ? '#4caf50' : '#f44336',
                                        fontWeight: 'bold'
                                    }}>
                                        {tatami.isActive ? '✅ Активно' : '❌ Неактивно'}
                                    </span>
                                </p>
                            </div>
                            
                            {canEdit && onStatusChange && (
                                <button
                                    onClick={() => onStatusChange(tatami._id, !tatami.isActive)}
                                    style={{
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        backgroundColor: tatami.isActive ? '#f44336' : '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {tatami.isActive ? 'Деактивировать' : 'Активировать'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default observer(TatamiList)