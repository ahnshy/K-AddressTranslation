"use client";

import { Container, Stack, Typography, TextField, Box, Button } from "@mui/material";
import AddressSearch from "@/components/AddressSearch";
import { ThemeControl } from "@/components/ThemeRegistry";
import { useState } from "react";

export default function Home() {
  const [address1, setAddress1] = useState("");  // KO
  const [addressEN, setAddressEN] = useState(""); // EN
  const [address2, setAddress2] = useState("");  // detail
  const [zip, setZip] = useState("");            // readonly zip
  const [resetSignal, setResetSignal] = useState(0);

  const doReset = () => {
    setAddress1(""); setAddressEN(""); setAddress2(""); setZip(""); setResetSignal((n)=>n+1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight={700}>
            K-AddressTranslation
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeControl />
            <Button variant="outlined" color="secondary" onClick={doReset}>
              초기화
            </Button>
          </Stack>
        </Stack>

        <Typography variant="body1">
          주소검색 영문주소 변환 템플릿입니다. (Address search English address translation template.)
        </Typography>
        <Typography variant="body2">
        키워드를 입력하면 후보지가 자동으로 표시됩니다.
        후보 선택 시 <b>주소1</b>에 전체 주소가 채워지고,
        <p><b>영문 주소</b>는 자동 변환되어 표시됩니다.<b>주소2</b> 란은 사용자가 상세주소를 입력합니다.</p>
        </Typography>

        <AddressSearch
          resetSignal={resetSignal}
          onSelect={({ ko, en, zip }) => {
            setAddress1(ko);
            setAddressEN(en || "");
            setZip(zip || "");
          }}
        />

        <Box>
          <TextField
            fullWidth
            label="주소 1 (자동 입력, 한국어)"
            value={address1}
            placeholder="예) 서울특별시 강남구 테헤란로 212 (역삼동)"
            InputProps={{ readOnly: true }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="영문 주소 (자동 변환)"
            value={addressEN}
            placeholder="e.g., 212, Teheran-ro, Gangnam-gu, Seoul"
            InputProps={{ readOnly: true }}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="주소 2 (사용자 입력)"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="동/호, 층, 기타 상세"
          />
          <TextField
            label="우편번호"
            value={zip}
            InputProps={{ readOnly: true }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
