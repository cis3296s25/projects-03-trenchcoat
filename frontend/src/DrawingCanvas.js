import { useRef, useEffect, useState } from 'react';

function DrawingCanvas({ socket }) {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);

    useEffect(() => {
        if (!socket) return;

        const canvas = canvasRef.current;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const startDrawing = (e) => {
            isDrawing.current = true;
            const { x, y } = getPos(e);
            socket.emit('startDrawing', { x, y });
        };

        const endDrawing = () => {
            isDrawing.current = false;
            socket.emit('endDrawing');
        };

        const draw = (e) => {
            if (!isDrawing.current) return;
            const { x, y } = getPos(e);

            socket.emit('drawing', {
                x,
                y,
                color: brushColor,
                size: brushSize
            });
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseout', endDrawing);
        canvas.addEventListener('mousemove', draw);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', endDrawing);
            canvas.removeEventListener('mouseout', endDrawing);
            canvas.removeEventListener('mousemove', draw);
        };
    }, [socket, brushColor, brushSize]);

    useEffect(() => {
        if (!socket) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        socket.on('startDrawing', ({ x, y }) => {
            ctx.beginPath();
            ctx.moveTo(x, y);
        });

        socket.on('drawing', ({ x, y, color, size }) => {
            ctx.lineWidth = size || 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color || 'black';
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        socket.on('endDrawing', () => {
            ctx.beginPath();
        });

        return () => {
            socket.off('startDrawing');
            socket.off('drawing');
            socket.off('endDrawing');
        };
    }, [socket]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem',
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>
                    Pen Color:
                    <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        style={{ marginLeft: '0.5rem' }}
                    />
                </label>
                <label>
                    Pen Size:
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        style={{ marginLeft: '0.5rem' }}
                    />
                    <span style={{ marginLeft: '0.5rem' }}>{brushSize}px</span>
                </label>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{ border: '2px solid black', background: 'white' }}
            />
        </div>
    );
}

export default DrawingCanvas;
