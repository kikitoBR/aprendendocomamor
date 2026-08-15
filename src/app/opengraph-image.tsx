import { ImageResponse } from 'next/og';

export const alt = 'Escola Aprendendo com Amor • Gestão Escolar & Portal da Família';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF4EC 50%, #FFE8D6 100%)',
          padding: '48px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Detalhe de Borda Superior */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '12px',
            background: 'linear-gradient(90deg, #EA4F05 0%, #FABC37 50%, #20B2AA 100%)',
          }}
        />

        {/* Card Central */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            borderRadius: '40px',
            padding: '48px 64px',
            boxShadow: '0 20px 50px rgba(234, 79, 5, 0.12)',
            border: '2px solid rgba(234, 79, 5, 0.15)',
            maxWidth: '1000px',
            width: '100%',
          }}
        >
          {/* Símbolo do Livro em Gradiente */}
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #EA4F05 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(234, 79, 5, 0.35)',
              marginBottom: '28px',
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 190 150"
              fill="none"
            >
              {/* Páginas do Livro em Amarelo Dourado e Branco */}
              <path
                fill="#FABC37"
                d="M139.174 117.108C153.967 116.378 167.975 117.92 181.752 123.471C180.185 125.606 178.481 128.319 176.999 130.563C171.294 127.544 158.801 125.681 152.115 125.342C136.672 124.56 118.207 125.766 105.479 135.689C101.882 138.493 101.873 141.939 98.9387 144.695C97.0101 146.507 93.525 147.753 90.8577 147.496C87.726 147.193 84.1026 145.608 82.4735 142.76C81.5073 141.071 80.7485 138.76 79.4212 137.356C71.8186 129.312 59.0802 126.146 48.491 125.445C37.1049 124.494 21.9391 126.103 11.3876 130.626C9.37877 128.29 7.9279 126.071 6.31683 123.488C32.1804 114.051 70.4267 113.389 88.058 138.616C88.693 139.524 90.4983 140.79 91.6133 140.84C94.9897 139.749 96.948 135.446 99.4152 132.66C109.293 121.507 124.855 117.921 139.174 117.108Z"
              />
              <path
                fill="#FABC37"
                d="M9.60696 107.09C14.8973 106.971 20.1886 106.896 25.4794 106.983C49.1117 107.372 74.2069 113.467 91.7629 130.135C93.3905 128.539 95.1075 127.037 96.9056 125.635C116.148 110.656 141.736 106.476 165.515 106.968C168.362 107.027 171.207 106.909 174.041 107.263C172.548 109.439 171.44 111.626 170.21 113.951C170.198 113.977 170.186 114.002 170.174 114.027C170.205 114.109 169.628 114.428 169.639 114.43C167.891 114.074 165.207 113.565 163.488 113.403C150.58 112.187 136.959 113.397 124.459 116.629C112.905 119.616 97.8828 126.534 91.7772 137.28C88.0206 132.293 84.5017 128.597 79.1755 125.179C62.0653 114.198 32.6853 110.393 13.1379 114.585C12.3959 112.547 9.97328 108.585 9.60696 107.09Z"
              />
              <path
                fill="#FFFFFF"
                d="M146.645 72.6042C150.093 72.1338 159.2 72.6252 162.667 73.2257C163.221 76.3526 163.773 79.3307 164.109 82.4887C157.563 80.6292 148.34 80.8014 141.589 81.656C125.571 83.6834 113.09 89.2633 101.541 100.524C97.7021 104.36 95.4729 106.884 92.5084 111.469C92.5482 109.638 92.5543 108.217 92.4381 106.393C95.3313 101.83 97.756 98.2452 101.372 94.2453C114.99 79.1838 126.767 73.857 146.645 72.6042Z"
              />
              <path
                fill="#FFFFFF"
                d="M27.2099 72.6065L27.3642 72.5925C43.3221 71.2055 61.9429 75.3316 73.9995 86.173C80.1751 91.7261 87.3933 98.8936 90.7419 106.651C91.1418 107.577 91.3071 110.319 91.4015 111.449C90.1722 109.779 88.8875 108.151 87.5496 106.568C81.6403 99.5338 75.6415 94.1147 67.5977 89.4946C55.8402 82.7414 32.8467 78.7114 19.8255 82.4287C19.6768 79.0531 20.2504 76.3151 21.0455 73.0987C23.098 72.9068 25.153 72.7427 27.2099 72.6065Z"
              />
            </svg>
          </div>

          {/* Título Principal */}
          <h1
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 12px 0',
              textAlign: 'center',
              letterSpacing: '-1px',
            }}
          >
            Escola Aprendendo com Amor
          </h1>

          {/* Subtítulo / Segmento */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#EA4F05',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Educação Infantil
            </span>
            <span style={{ fontSize: '20px', color: '#CBD5E1' }}>•</span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Ensino Fundamental
            </span>
          </div>

          {/* Badge Informativo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              padding: '10px 24px',
              borderRadius: '999px',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#C2410C' }}>
              Portal de Gestão Escolar & Portal da Família 📚✨
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
