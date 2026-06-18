import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const GraphComp = ({ data }) => {
    // Prepare the data for Recharts
    const chartData = [
        { name: 'Gaze on left side', value: data.left_count },
        { name: 'Gaze on right side', value: data.right_count }
    ];

    // Define colors matching our theme (Left/Negative is Red, Right/Positive is Emerald)
    const COLORS = ['#ef4444', '#10b981'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    isAnimationActive={true}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '11px'
                    }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default GraphComp;
