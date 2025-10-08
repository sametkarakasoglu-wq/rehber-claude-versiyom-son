
#!/bin/bash
# Araç Filo Yönetimi - Sunucu Başlatma Scripti

echo "🚗 Araç Filo Yönetimi Uygulaması Başlatılıyor..."
echo ""

# Mevcut sunucuları durdur
echo "🛑 Eski sunucular durduruluyor..."
pkill -f "python3 -m http.server 3000" 2>/dev/null
pkill -f "vite --host" 2>/dev/null
sleep 1

# Port kontrolü
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 hala kullanımda. Temizleniyor..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null
    sleep 1
fi

# Uygulamayı başlat
cd /home/ubuntu/filo_yonetim_app
echo "✅ Sunucu başlatılıyor: http://localhost:3000"
echo "📱 Tarayıcınızda açın: http://localhost:3000"
echo ""
echo "Durdurmak için: Ctrl+C"
echo "----------------------------------------"
python3 -m http.server 3000
