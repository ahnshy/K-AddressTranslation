"use client";

import * as React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import debounce from "lodash.debounce";
import { useThemeMode } from "@/components/ThemeRegistry";

type Item = {
  roadAddr: string;
  jibunAddr?: string;
  zipNo?: string;
  sido?: string;
  sigungu?: string;
  eupmyeon?: string;
  roadName?: string;
  buildingName?: string;
  raw?: any;
};

export default function AddressSearch({
  onSelect,
  resetSignal = 0,
}: {
  onSelect: (payload: { ko: string; en?: string; zip?: string }) => void;
  resetSignal?: number; // increments to force reset
}) {
  const { mode } = useThemeMode();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Inline search states (controlled)
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [value, setValue] = React.useState<Item | null>(null);

  // Popup states
  const [dlgOpen, setDlgOpen] = React.useState(false);
  const [pOpen, setPOpen] = React.useState(false);
  const [pOptions, setPOptions] = React.useState<Item[]>([]);
  const [pLoading, setPLoading] = React.useState(false);
  const [pInput, setPInput] = React.useState("");
  const [pValue, setPValue] = React.useState<Item | null>(null);

  const debouncedFetch = React.useMemo(
    () =>
      debounce(async (q: string, setter: (items: Item[]) => void, setBusy: (b: boolean) => void) => {
        if (!q || q.trim().length < 1) {
          setter([]);
          setBusy(false);
          return;
        }
        setBusy(true);
        try {
          const url = new URL("/api/address", window.location.origin);
          url.searchParams.set("q", q);
          url.searchParams.set("lang", "ko");
          const res = await fetch(url.toString(), { cache: "no-store" });
          const data = await res.json();
          setter(data.items ?? []);
        } catch (e) {
          console.error(e);
          setter([]);
        } finally {
          setBusy(false);
        }
      }, 250),
    []
  );

  React.useEffect(() => {
    debouncedFetch(input, setOptions, setLoading);
  }, [input, debouncedFetch]);

  React.useEffect(() => {
    debouncedFetch(pInput, setPOptions, setPLoading);
  }, [pInput, debouncedFetch]);

  const doImmediateSearch = React.useCallback(async () => {
    const q = input.trim();
    if (!q) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const url = new URL("/api/address", window.location.origin);
      url.searchParams.set("q", q);
      url.searchParams.set("lang", "ko");
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      setOptions(data.items ?? []);
      setOpen(true);
    } catch (e) {
      console.error(e);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  // Reset from parent
  React.useEffect(() => {
    setInput(""); setValue(null); setOptions([]); setOpen(false);
    setPInput(""); setPValue(null); setPOptions([]); setPOpen(false); setDlgOpen(false);
  }, [resetSignal]);

  async function fetchEnglishFrom(koItem: Item) {
    try {
      const key = koItem.zipNo || koItem.roadAddr;
      if (!key) return undefined;
      const url = new URL("/api/address", window.location.origin);
      url.searchParams.set("q", key);
      url.searchParams.set("lang", "en");
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      const en = (data.items ?? [])[0]?.roadAddr as string | undefined;
      return en;
    } catch (e) {
      console.error("fetch EN failed", e);
      return undefined;
    }
  }

  const renderOption = (props: any, option: Item) => (
    <Box component="li" {...props}>
      <Box>
        <Typography variant="body2" fontWeight={600}>{option.roadAddr}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {option.zipNo ? <Chip size="small" label={"우편번호: " + option.zipNo} /> : null}
          {option.jibunAddr ? <Typography variant="caption" color="text.secondary">지번: {option.jibunAddr}</Typography> : null}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
        <Stack flex={1}>
          <Autocomplete
            fullWidth
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            filterOptions={(x) => x}
            getOptionLabel={(o) => o.roadAddr || ""}
            options={options}
            loading={loading}
            value={value}
            onChange={async (_, newValue) => {
              setValue(newValue);
              if (newValue?.roadAddr) {
                const en = await fetchEnglishFrom(newValue);
                onSelect({ ko: newValue.roadAddr, en, zip: newValue.zipNo });
              }
            }}
            inputValue={input}
            onInputChange={(_, newInput) => setInput(newInput)}
            slotProps={{
              paper: { sx: { maxHeight: { xs: 360, sm: 480 } } },
              listbox: { sx: { maxHeight: { xs: 320, sm: 440 }, overflow: "auto" } },
              popper: { sx: { width: 1 } },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="주소 검색 (한국어)"
                placeholder="예) 역삼동, 테헤란로, 선릉로69길"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={renderOption}
          />
        </Stack>
        <Button
          variant="contained"
          onClick={doImmediateSearch}
          sx={{
            minWidth: { xs: 96, sm: 110 },
            height: { xs: 55, sm: 55 },
            ...(mode === "night"
              ? { backgroundColor: "#FFA500", color: "#1a1a1a", "&:hover": { backgroundColor: "#E59400" } }
              : {}),
          }}
        >
          검색
        </Button>
        <Button
          variant="outlined"
          onClick={() => setDlgOpen(true)}
          sx={{ minWidth: { xs: 96, sm: 110 }, height: { xs: 55, sm: 55 } }}
        >
          팝업창
        </Button>
      </Stack>

      <Dialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isXs}
        PaperProps={{ sx: { m: { xs: 0, sm: 2 } } }}
      >
        <DialogTitle>주소 검색 (팝업)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              fullWidth
              open={pOpen}
              onOpen={() => setPOpen(true)}
              onClose={() => setPOpen(false)}
              filterOptions={(x) => x}
              getOptionLabel={(o) => o.roadAddr || ""}
              options={pOptions}
              loading={pLoading}
              value={pValue}
              onChange={async (_, newValue) => {
                setPValue(newValue);
                if (newValue?.roadAddr) {
                  const en = await fetchEnglishFrom(newValue);
                  onSelect({ ko: newValue.roadAddr, en, zip: newValue.zipNo });
                  setDlgOpen(false);
                }
              }}
              inputValue={pInput}
              onInputChange={(_, newInput) => setPInput(newInput)}
              slotProps={{
                paper: { sx: { maxHeight: { xs: 360, sm: 520 } } },
                listbox: { sx: { maxHeight: { xs: 320, sm: 480 }, overflow: "auto" } },
                popper: { sx: { width: 1 } },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  label="주소 검색 (한국어)"
                  placeholder="예) 역삼동, 테헤란로, 선릉로69길"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {pLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={renderOption}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
