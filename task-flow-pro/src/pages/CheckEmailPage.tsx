import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function CheckEmailPage() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const email = params.get('email') || '';
  const { resendVerification } = useAuth();
  const { success, error } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      error('Нет email', 'Мы не знаем, на какой адрес отправлять письмо');
      return;
    }
    try {
      setIsSending(true);
      await resendVerification(email);
      success('Письмо отправлено', 'Проверьте входящие и папку Спам');
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Не удалось отправить письмо';
      error('Ошибка', m);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Подтвердите email</h1>
          <p className="text-muted-foreground mb-4">
            Мы отправили письмо с подтверждением на адрес{email ? ' ' : ''}
            {email && <span className="font-medium text-foreground">{email}</span>}.
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={handleResend} disabled={isSending}>
              <RefreshCw className="w-4 h-4 mr-2" /> {isSending ? 'Отправляем…' : 'Отправить письмо повторно'}
            </Button>
            <a href="mailto:" className="block">
              <Button variant="outline" className="w-full">
                Открыть почтовый клиент
              </Button>
            </a>
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться к входу
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}


