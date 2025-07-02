<svelte:head>
  <title>Privacy Policy - 그레이트 킹덤 온라인</title>
</svelte:head>

<section>
  <h2>개인정보 처리방침</h2>
  <p>
    저희 서비스는 최소한의 정보로 사용자 인증을 처리하며, 아래와 같이 개인정보
    보호 조치를 시행하고 있습니다.
  </p>

  <h3>1. 수집 및 저장 정보</h3>
  <ul>
    <li>사용자 ID (이메일 또는 닉네임 등, 로그인 식별자)</li>
    <li>비밀번호 해시값 (복호화 불가능한 암호화 처리)</li>
    <li>로그인 시 생성되는 JWT(Json Web Token)</li>
  </ul>

  <h3>2. JWT 사용 및 저장 방식</h3>
  <ul>
    <li>
      <strong>Access Token</strong>은 사용자의
      <strong>브라우저 로컬스토리지(localStorage)</strong>에 저장되며, 로그인
      상태 유지를 위해 사용됩니다.
    </li>
    <li>
      <strong>Refresh Token</strong>은 <strong>HttpOnly, Secure 쿠키</strong>로
      저장되며, Access Token 갱신에만 사용됩니다.
    </li>
    <li>
      서버는 Refresh Token을 통해 새로운 Access Token을 발급하며, 클라이언트는
      이를 로컬스토리지에 갱신합니다.
    </li>
    <li>
      Access Token은 일정 시간이 지나면 만료되며, 자동으로 갱신되거나
      로그아웃됩니다.
    </li>
  </ul>

  <h3>3. 자동 로그아웃 정책</h3>
  <p>
    사용자가 마지막 활동을 한 시점으로부터 <strong>24시간</strong>이 경과하면
    자동으로 로그아웃됩니다. 이때 Refresh Token도 삭제되며, 다시 로그인이
    필요합니다.
  </p>

  <h3>4. 보안 조치</h3>
  <ul>
    <li>비밀번호는 일방향 해시 처리되어 저장되며 복호화가 불가능합니다.</li>
    <li>토큰은 HTTPS를 통해 암호화되어 안전하게 전송됩니다.</li>
    <li>
      Refresh Token은 자바스크립트에서 접근할 수 없는 <strong
        >HttpOnly 쿠키</strong
      >로 저장됩니다.
    </li>
    <li>
      Cross-Site Scripting(XSS) 방지를 위해 클라이언트 측에 보안 정책을 적용하고
      있습니다.
    </li>
  </ul>

  <h3>5. 제3자 제공 없음</h3>
  <p>
    사용자의 인증 정보는 제3자에게 제공되지 않으며, 서비스 내부 인증 처리에만
    사용됩니다.
  </p>

  <h3>6. 이용자의 권리</h3>
  <ul>
    <li>
      서비스 탈퇴 시, 아이디 및 비밀번호 해시 등 관련 정보는 즉시 삭제됩니다.
    </li>
    <li>JWT는 클라이언트 측에서만 관리되며, 서버에서는 저장하지 않습니다.</li>
  </ul>

  <p>
    <strong
      >저희는 개인정보를 최소한으로 수집하고, 서비스 제공 및 보안 유지를 위한
      목적으로만 사용합니다.</strong
    >
  </p>
</section>
