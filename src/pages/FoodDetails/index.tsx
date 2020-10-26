import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  image_url: string;
  thumbnail_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get<Food>(`foods/${routeParams.id}`);

      const formattedFood = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
        category: response.data.category,
        image_url: response.data.image_url,
        thumbnail_url: food.thumbnail_url,
        formattedPrice: formatValue(response.data.price),
        extras: response.data.extras,
      };

      const formattedExtras = response.data.extras.map(extra => {
        return {
          id: extra.id,
          name: extra.name,
          value: extra.value,
          quantity: 0,
        };
      });

      setFood(formattedFood);
      setExtras(formattedExtras);
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    setExtras(state => {
      return state.map(extra => {
        if (extra.id === id) {
          extra.quantity++;
        }

        return extra;
      });
    });
  }

  function handleDecrementExtra(id: number): void {
    setExtras(state => {
      return state.map(extra => {
        if (extra.id === id && extra.quantity > 0) {
          extra.quantity--;
        }

        return extra;
      });
    });
  }

  function handleIncrementFood(): void {
    setFoodQuantity(state => state + 1);
  }

  function handleDecrementFood(): void {
    setFoodQuantity(state => {
      if (state > 1) {
        state--;
      }

      return state;
    });
  }

  const toggleFavorite = useCallback(() => {
    setIsFavorite(state => !state);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const extrasTotalValue = extras.reduce((acc, current) => {
      return acc + current.value * current.quantity;
    }, 0);

    const foodTotalValue = food.price * foodQuantity;

    if (extrasTotalValue > 0) {
      return formatValue(extrasTotalValue + foodTotalValue);
    }

    return formatValue(foodTotalValue);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    await api.post('orders', {
      product_id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      thumbnail_url: food.image_url,
      extras,
    });
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color='#FFB84D'
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color='#6C6C80'
                  name='minus'
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color='#6C6C80'
                  name='plus'
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID='cart-total'>{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color='#6C6C80'
                name='minus'
                onPress={handleDecrementFood}
                testID='decrement-food'
              />
              <AdittionalItemText testID='food-quantity'>
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color='#6C6C80'
                name='plus'
                onPress={handleIncrementFood}
                testID='increment-food'
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name='check-square' size={24} color='#fff' />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
