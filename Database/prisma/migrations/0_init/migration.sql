��- -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` a l l _ t a g s `   ( 
 
         ` t a g _ i d `   I N T E G E R   N U L L   D E F A U L T   2 , 
 
         ` t a g _ g r o u p _ i d `   I N T E G E R   N O T   N U L L   D E F A U L T   0 , 
 
         ` t a g _ N a m e `   V A R C H A R ( 4 0 )   N U L L   D E F A U L T   ' e m p t y ' , 
 
 
 
         U N I Q U E   I N D E X   ` a l l _ t a g s _ U N ` ( ` t a g _ i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` a l l _ t a g s _ g r o u p `   ( 
 
         ` t a g _ g r o u p _ i d `   I N T E G E R   N O T   N U L L , 
 
         ` t a g _ g r o u p _ n a m e `   V A R C H A R ( 1 0 )   N U L L , 
 
 
 
         P R I M A R Y   K E Y   ( ` t a g _ g r o u p _ i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` c h a t _ m e s s a g e s `   ( 
 
         ` m e s s a g e _ i d `   I N T E G E R   N O T   N U L L   A U T O _ I N C R E M E N T , 
 
         ` c o n t e n t `   T E X T   N U L L , 
 
         ` s e n d e r _ i d `   I N T E G E R   N O T   N U L L , 
 
         ` r e c e i v e r _ i d `   I N T E G E R   N O T   N U L L , 
 
         ` t i m e _ s t a m p `   T I M E S T A M P ( 0 )   N U L L , 
 
 
 
         P R I M A R Y   K E Y   ( ` m e s s a g e _ i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` r e c o r d _ l o g _ t a b l e `   ( 
 
         ` i d `   I N T E G E R   N O T   N U L L   A U T O _ I N C R E M E N T , 
 
         ` d a t a _ t e x t `   V A R C H A R ( 2 0 0 )   N O T   N U L L , 
 
         ` c r e a t e d _ a t `   T I M E S T A M P ( 0 )   N U L L   D E F A U L T   C U R R E N T _ T I M E S T A M P ( 0 ) , 
 
 
 
         P R I M A R Y   K E Y   ( ` i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` r e q u e s t _ l o g s `   ( 
 
         ` I d `   I N T E G E R   N O T   N U L L   A U T O _ I N C R E M E N T , 
 
         ` p a t h `   V A R C H A R ( 2 5 5 )   N O T   N U L L , 
 
         ` m e t h o d `   V A R C H A R ( 1 0 )   N O T   N U L L , 
 
         ` c l i e n t _ i p `   V A R C H A R ( 4 5 )   N O T   N U L L , 
 
         ` c r e a t e d _ a t `   D A T E T I M E ( 0 )   N O T   N U L L , 
 
 
 
         P R I M A R Y   K E Y   ( ` I d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` u s e r _ d e t a i l `   ( 
 
         ` u d _ u s e r _ i d `   I N T E G E R   N O T   N U L L   A U T O _ I N C R E M E N T , 
 
         ` g e n d e r `   V A R C H A R ( 1 0 )   N U L L , 
 
         ` b i r t h d a y `   D A T E   N U L L , 
 
         ` u s e r _ h a s _ t a g `   J S O N   N U L L , 
 
         ` p r o f i l e _ p i c t u r e `   V A R C H A R ( 2 5 5 )   N U L L , 
 
         ` i n t e r e s t s `   T E X T   N U L L , 
 
         ` p e r s o n a l _ d e s c r i p t i o n `   T E X T   N U L L , 
 
         ` l o c a t i o n `   V A R C H A R ( 1 0 0 )   N U L L , 
 
         ` r e l a t i o n s h i p _ s t a t u s `   E N U M ( ' S i n g l e ' ,   ' M a r r i e d ' ,   ' D i v o r c e d ' ,   ' O t h e r ' )   N U L L , 
 
         ` l o o k i n g _ f o r `   E N U M ( ' F r i e n d s h i p ' ,   ' D a t i n g ' ,   ' L o n g - t e r m   R e l a t i o n s h i p ' ,   ' O t h e r ' )   N U L L , 
 
         ` p r i v a c y _ s e t t i n g s `   J S O N   N U L L , 
 
         ` s o c i a l _ l i n k s `   J S O N   N U L L , 
 
         ` i s _ b a n n e d `   B O O L E A N   N U L L   D E F A U L T   f a l s e , 
 
 
 
         P R I M A R Y   K E Y   ( ` u d _ u s e r _ i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   C r e a t e T a b l e 
 
 C R E A T E   T A B L E   ` u s e r s `   ( 
 
         ` u s e r _ i d `   I N T E G E R   N O T   N U L L   A U T O _ I N C R E M E N T , 
 
         ` a c c o u n t `   V A R C H A R ( 1 0 0 )   N O T   N U L L , 
 
         ` u s e r n a m e `   V A R C H A R ( 5 0 )   N O T   N U L L , 
 
         ` p a s s w o r d `   V A R C H A R ( 1 0 0 )   N O T   N U L L , 
 
         ` e m a i l `   V A R C H A R ( 1 0 0 )   N O T   N U L L , 
 
         ` c r e a t e d _ a t `   T I M E S T A M P ( 0 )   N U L L   D E F A U L T   C U R R E N T _ T I M E S T A M P ( 0 ) , 
 
         ` u p d a t e d _ a t `   T I M E S T A M P ( 0 )   N U L L   D E F A U L T   C U R R E N T _ T I M E S T A M P ( 0 ) , 
 
 
 
         U N I Q U E   I N D E X   ` A c c o u n t ` ( ` a c c o u n t ` ) , 
 
         P R I M A R Y   K E Y   ( ` u s e r _ i d ` ) 
 
 )   D E F A U L T   C H A R A C T E R   S E T   u t f 8 m b 4   C O L L A T E   u t f 8 m b 4 _ u n i c o d e _ c i ; 
 
 
 
 - -   A d d F o r e i g n K e y 
 
 A L T E R   T A B L E   ` u s e r _ d e t a i l `   A D D   C O N S T R A I N T   ` f k _ u s e r d e t a i l _ u s e r `   F O R E I G N   K E Y   ( ` u d _ u s e r _ i d ` )   R E F E R E N C E S   ` u s e r s ` ( ` u s e r _ i d ` )   O N   D E L E T E   N O   A C T I O N   O N   U P D A T E   N O   A C T I O N ; 
 
 
 
 